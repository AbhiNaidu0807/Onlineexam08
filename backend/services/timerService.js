import { calculateScore } from './scoreService.js';
import { updateLeaderboard } from './leaderboardService.js';
import client from '../config/db.js';

export const startTimerService = () => {
  console.log('Timer service started');
  
  setInterval(async () => {
    try {
      // Find in-progress attempts that have exceeded the duration
      const now = new Date();
      const expiredAttempts = await client.execute(`
        SELECT a.id, a.user_id, a.exam_id, e.duration, a.start_time
        FROM attempts a
        JOIN exams e ON a.exam_id = e.id
        WHERE a.status = 'in_progress'
        AND (strftime('%s', 'now') - strftime('%s', a.start_time)) >= (e.duration * 60)
      `);

      for (const attempt of expiredAttempts.rows) {
        console.log(`Auto-submitting attempt ${attempt.id} for user ${attempt.user_id}`);
        
        // Fetch questions and answers for grading
        const questionsRes = await client.execute({
          sql: 'SELECT * FROM questions WHERE exam_id = ?',
          args: [attempt.exam_id]
        });
        
        const answersRes = await client.execute({
          sql: 'SELECT * FROM answers WHERE attempt_id = ?',
          args: [attempt.id]
        });

        const { score, totalMarks, gradedAnswers } = calculateScore(questionsRes.rows, answersRes.rows);

        // Update answers with grading
        for (const ga of gradedAnswers) {
          await client.execute({
            sql: `UPDATE answers 
                  SET is_correct = ?, marks_awarded = ? 
                  WHERE attempt_id = ? AND question_id = ?`,
            args: [ga.is_correct, ga.marks_awarded, attempt.id, ga.question_id]
          });
        }

        // Finalize attempt
        await client.execute({
          sql: `UPDATE attempts 
                SET status = 'submitted', 
                    submit_time = CURRENT_TIMESTAMP, 
                    score = ?, 
                    total_marks = ?, 
                    auto_submitted = 1 
                WHERE id = ?`,
          args: [score, totalMarks, attempt.id]
        });

        // Update leaderboard
        await updateLeaderboard(attempt.exam_id);
      }
    } catch (error) {
      console.error('Timer service error:', error);
    }
  }, 30000); // Check every 30 seconds
};
