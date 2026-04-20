import { calculateScore } from './scoreService.js';
import { updateLeaderboard } from './leaderboardService.js';
import client, { executeWithRetry } from '../config/db.js';

/**
 * AUTOMATED EVALUATION SWEEP SERVICE
 * Runs in the background to finalize expired exam attempts.
 * Upgraded with ExecuteWithRetry for maximum data integrity.
 */
export const startTimerService = () => {
  console.log('[SYSTEM] Automated Timer Service Initialized');
  
  setInterval(async () => {
    try {
      // Step 1: Identify Expired Missions
      const expiredAttempts = await executeWithRetry(`
        SELECT a.id, a.user_id, a.exam_id, e.duration, a.start_time
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE a.status = 'in_progress'
        AND (strftime('%s', 'now') - strftime('%s', a.start_time)) >= (e.duration * 60)
      `);

      for (const attempt of expiredAttempts.rows) {
        console.log(`[AUTO-SYNC] Finalizing Attempt ${attempt.id} (User: ${attempt.user_id})`);
        
        // Step 2: Extract Assessment Data
        const [questionsRes, answersRes] = await Promise.all([
          executeWithRetry({ sql: 'SELECT * FROM questions WHERE exam_id = ?', args: [attempt.exam_id] }),
          executeWithRetry({ sql: 'SELECT * FROM answers WHERE attempt_id = ?', args: [attempt.id] })
        ]);
        
        // Step 3: Grade Dataset
        const { score, totalMarks, gradedAnswers } = calculateScore(questionsRes.rows, answersRes.rows);

        // Step 4: Persist Graded Map
        for (const ga of gradedAnswers) {
          await executeWithRetry({
            sql: `UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE attempt_id = ? AND question_id = ?`,
            args: [ga.is_correct, ga.marks_awarded, attempt.id, ga.question_id]
          });
        }

        // Step 5: Seal Attempt
        const startTime = new Date(attempt.start_time);
        const timeTaken = Math.max(0, Math.floor((new Date() - startTime) / 1000));

        await executeWithRetry({
          sql: `UPDATE attempts SET status = 'submitted', submit_time = CURRENT_TIMESTAMP, score = ?, total_marks = ?, time_taken = ?, auto_submitted = 1 WHERE id = ?`,
          args: [score, totalMarks, timeTaken, attempt.id]
        });

        // Step 6: Update Competitive Metrics
        await updateLeaderboard(attempt.exam_id);
      }
    } catch (error) {
      console.error('[TIMER CRITICAL]: Network or Database protocol failure during auto-sync:', error.message);
    }
  }, 60000); // Optimized to check every 60 seconds
};
