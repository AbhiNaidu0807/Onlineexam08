import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createNotification } from './notificationController.js';

export const getExams = async (req, res) => {
  try {
    let sql = `SELECT e.*, (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as question_count FROM exams e`;
    if (req.user.role === 'student') {
      sql += ' WHERE e.is_published = 1';
    }
    const result = await client.execute(sql);
    return successResponse(res, result.rows);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const createExam = async (req, res) => {
  const { title, duration, passing_score, start_time, end_time } = req.body;
  if (!title || !duration || !passing_score || !start_time || !end_time) {
    return errorResponse(res, 'All fields are required', 'Bad Request', 400);
  }

  try {
    const result = await client.execute({
      sql: 'INSERT INTO exams (title, duration, passing_score, start_time, end_time, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      args: [title, duration, passing_score, start_time, end_time, req.user.id]
    });
    return successResponse(res, { id: result.lastInsertRowid.toString() }, 'Exam created successfully', 201);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const examRes = await client.execute({
      sql: 'SELECT * FROM exams WHERE id = ?',
      args: [id]
    });

    if (examRes.rows.length === 0) {
      return errorResponse(res, 'Exam not found', 'Not Found', 404);
    }

    const exam = examRes.rows[0];
    if (req.user.role === 'student' && !exam.is_published) {
      return errorResponse(res, 'Exam not published', 'Forbidden', 403);
    }

    const questionsRes = await client.execute({
      sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
      args: [id]
    });

    // If admin, include correct answers
    if (req.user.role === 'admin') {
      const fullQuestions = await client.execute({
        sql: 'SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
        args: [id]
      });
      return successResponse(res, { ...exam, questions: fullQuestions.rows });
    }

    return successResponse(res, { ...exam, questions: questionsRes.rows });
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const updateExam = async (req, res) => {
  const { id } = req.params;
  const { title, duration, passing_score, start_time, end_time, is_published } = req.body;
  
  try {
    await client.execute({
      sql: `UPDATE exams SET title = ?, duration = ?, passing_score = ?, start_time = ?, end_time = ?, is_published = ? 
            WHERE id = ?`,
      args: [title, duration, passing_score, start_time, end_time, is_published, id]
    });
    return successResponse(res, null, 'Exam updated successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    await client.execute({
      sql: 'DELETE FROM exams WHERE id = ?',
      args: [id]
    });
    return successResponse(res, null, 'Exam deleted successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const publishExam = async (req, res) => {
  const { id } = req.params;
  try {
    await client.execute({
      sql: 'UPDATE exams SET is_published = 1 WHERE id = ?',
      args: [id]
    });
    
    // Notify all students
    const examRes = await client.execute({ sql: 'SELECT title FROM exams WHERE id = ?', args: [id] });
    const students = await client.execute("SELECT id FROM users WHERE role = 'student'");
    
    for (const student of students.rows) {
      await createNotification(student.id, 'EXAM_PUBLISHED', `New Exam Available: ${examRes.rows[0].title}`);
    }

    return successResponse(res, null, 'Exam published successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const getExamResults = async (req, res) => {
  const { id } = req.params;
  try {
    const results = await client.execute({
      sql: `SELECT a.*, u.name, u.email 
            FROM attempts a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.exam_id = ? AND a.status = 'submitted'`,
      args: [id]
    });
    return successResponse(res, results.rows);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};
