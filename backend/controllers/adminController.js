import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAdminDashboard = async (req, res) => {
  try {
    const totalExams = (await client.execute('SELECT COUNT(*) as count FROM exams')).rows[0].count;
    const totalStudents = (await client.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'")).rows[0].count;
    const totalSubmissions = (await client.execute("SELECT COUNT(*) as count FROM attempts WHERE status = 'submitted'")).rows[0].count;
    
    const recentSubmissions = await client.execute(`
      SELECT a.*, u.name, u.email, e.title as exam_title 
      FROM attempts a 
      JOIN users u ON a.user_id = u.id 
      JOIN exams e ON a.exam_id = e.id 
      WHERE a.status = 'submitted' 
      ORDER BY a.submit_time DESC LIMIT 5
    `);

    return successResponse(res, {
      totalExams,
      totalStudents,
      totalSubmissions,
      recentSubmissions: recentSubmissions.rows
    });
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await client.execute(`
      SELECT u.id, u.name, u.email, u.created_at, 
      (SELECT COUNT(*) FROM attempts WHERE user_id = u.id) as attempt_count 
      FROM users u WHERE u.role = 'student'
    `);
    return successResponse(res, students.rows);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const gradeAnswer = async (req, res) => {
  const { answer_id, is_correct, marks_awarded } = req.body;
  try {
    await client.execute({
      sql: 'UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE id = ?',
      args: [is_correct ? 1 : 0, marks_awarded, answer_id]
    });
    
    // Recalculate attempt score
    const answerRes = await client.execute({ sql: 'SELECT attempt_id FROM answers WHERE id = ?', args: [answer_id] });
    const attemptId = answerRes.rows[0].attempt_id;
    
    const results = await client.execute({
       sql: 'SELECT SUM(marks_awarded) as score FROM answers WHERE attempt_id = ?',
       args: [attemptId]
    });
    const newScore = results.rows[0].score;
    
    await client.execute({
       sql: 'UPDATE attempts SET score = ? WHERE id = ?',
       args: [newScore, attemptId]
    });

    return successResponse(res, { newScore }, 'Answer graded successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const grantRetake = async (req, res) => {
  const { user_id, exam_id } = req.body;
  
  if (!user_id || !exam_id) {
    return errorResponse(res, 'Missing user_id or exam_id', 'Bad Request', 400);
  }

  try {
    // Use INSERT OR REPLACE to handle cases where permission already exists
    await client.execute({
      sql: `INSERT OR REPLACE INTO retake_permissions (user_id, exam_id, granted_by, granted_at) 
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      args: [user_id, exam_id, req.user.id]
    });
    
    // Also clear existing attempts to allow a fresh start
    await client.execute({
      sql: 'DELETE FROM attempts WHERE user_id = ? AND exam_id = ?',
      args: [user_id, exam_id]
    });

    return successResponse(res, null, 'Retake permission granted and existing attempts cleared');
  } catch (error) {
    console.error('Grant Retake Error:', error);
    return errorResponse(res, error, 'Server Error');
  }
};
