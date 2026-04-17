import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const saveAnswer = async (req, res) => {
  const { attempt_id, question_id, answer } = req.body;

  if (!attempt_id || !question_id) {
    return errorResponse(res, 'Attempt ID and Question ID are required', 'Bad Request', 400);
  }

  try {
    // UPSERT answer
    await client.execute({
      sql: `INSERT INTO answers (attempt_id, question_id, answer, saved_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(attempt_id, question_id) DO UPDATE SET 
            answer = excluded.answer, 
            saved_at = CURRENT_TIMESTAMP`,
      args: [attempt_id, question_id, answer]
    });

    return successResponse(res, null, 'Answer saved');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};
