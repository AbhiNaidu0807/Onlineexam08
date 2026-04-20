import { executeWithRetry } from '../config/db.js';

/**
 * COMPETITIVE METRIC ENGINE
 * Rebuilds leaderboard rankings for a specific assessment.
 * Precision-hardened against database connection timeouts.
 */
export const updateLeaderboard = async (examId) => {
  try {
    // Step 1: Query Competitive Dataset
    const attempts = await executeWithRetry({
      sql: `SELECT user_id, score, total_marks, 
            (strftime('%s', submit_time) - strftime('%s', start_time)) as time_taken,
            submit_time
            FROM attempts 
            WHERE exam_id = ? AND status = 'submitted'
            ORDER BY score DESC, time_taken ASC, submit_time ASC`,
      args: [examId]
    });

    // Step 2: Clear Obsolete Rankings
    await executeWithRetry({
      sql: 'DELETE FROM leaderboard WHERE exam_id = ?',
      args: [examId]
    });

    // Step 3: Insert Ranked Matrix
    for (let i = 0; i < attempts.rows.length; i++) {
      const row = attempts.rows[i];
      await executeWithRetry({
        sql: `INSERT INTO leaderboard (exam_id, user_id, score, total_marks, time_taken, submit_time, rank)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          examId, 
          row.user_id, 
          row.score || 0, 
          row.total_marks || 0, 
          row.time_taken || 0, 
          row.submit_time || new Date().toISOString(), 
          i + 1
        ]
      });
    }

    console.log(`[LEADERBOARD] Synchronized rankings for exam ${examId}`);
  } catch (error) {
    console.error('[LEADERBOARD ERROR]: Protocol failure during ranking update:', error.message);
  }
};
