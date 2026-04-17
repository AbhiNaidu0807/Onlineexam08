import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getLeaderboard = async (req, res) => {
  const { examId } = req.params;
  try {
    const result = await client.execute({
      sql: `SELECT l.*, u.name as user_name, u.profile_photo 
            FROM leaderboard l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.exam_id = ? 
            ORDER BY l.rank ASC`,
      args: [examId]
    });
    return successResponse(res, result.rows);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};
