import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const globalSearch = async (req, res) => {
  const { query } = req.query;
  const isAdmin = req.user.role === 'admin';

  if (!query) {
    return successResponse(res, { exams: [], students: [], results: [] });
  }

  try {
    const searchQuery = `%${query}%`;
    
    // Search Exams
    const exams = await client.execute({
      sql: `SELECT id, title, duration FROM exams 
            WHERE title LIKE ? AND (is_published = 1 OR created_by = ?) 
            LIMIT 5`,
      args: [searchQuery, req.user.id]
    });

    let students = [];
    if (isAdmin) {
      // Search Students (Admin only)
      students = await client.execute({
        sql: `SELECT id, name, email FROM users 
              WHERE role = 'student' AND (name LIKE ? OR email LIKE ?) 
              LIMIT 5`,
        args: [searchQuery, searchQuery]
      });
    }

    // Search Results / Attempts
    const results = await client.execute({
      sql: `SELECT a.id, e.title as exam_title, a.score, a.total_marks, a.submit_time 
            FROM attempts a 
            JOIN exams e ON a.exam_id = e.id 
            WHERE (e.title LIKE ? OR a.status LIKE ?) 
            AND (a.user_id = ? OR ? = 1) 
            AND a.status = 'submitted'
            LIMIT 5`,
      args: [searchQuery, searchQuery, req.user.id, isAdmin ? 1 : 0]
    });

    return successResponse(res, {
      exams: exams.rows,
      students: students.rows,
      results: results.rows
    });
  } catch (error) {
    return errorResponse(res, error, 'Search failed');
  }
};
