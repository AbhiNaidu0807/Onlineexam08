import client from '../config/db.js';

export const updateLeaderboard = async (examId) => {
  try {
    // Fetch all submitted attempts for this exam
    const attempts = await client.execute({
      sql: `SELECT user_id, score, total_marks, 
            (strftime('%s', submit_time) - strftime('%s', start_time)) as time_taken,
            submit_time
            FROM attempts 
            WHERE exam_id = ? AND status = 'submitted'
            ORDER BY score DESC, time_taken ASC, submit_time ASC`,
      args: [examId]
    });

    // Delete existing entries for this exam in leaderboard
    await client.execute({
      sql: 'DELETE FROM leaderboard WHERE exam_id = ?',
      args: [examId]
    });

    // Insert new ranked entries
    for (let i = 0; i < attempts.rows.length; i++) {
      const row = attempts.rows[i];
      await client.execute({
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

    console.log(`Leaderboard updated for exam ${examId}`);
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
};
