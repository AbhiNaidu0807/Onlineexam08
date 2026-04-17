import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { parseExcel } from '../services/excelService.js';

export const getQuestionsByExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const result = await client.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
      args: [examId]
    });
    return successResponse(res, result.rows);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const addQuestion = async (req, res) => {
  const { exam_id, type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks, order_index } = req.body;
  
  try {
    const result = await client.execute({
      sql: `INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks, order_index) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [exam_id, type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks, order_index || 0]
    });
    return successResponse(res, { id: result.lastInsertRowid.toString() }, 'Question added successfully', 201);
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks, order_index } = req.body;
  
  try {
    await client.execute({
      sql: `UPDATE questions SET type = ?, question_text = ?, options = ?, correct_answer = ?, explanation = ?, language = ?, base_code = ?, test_cases = ?, marks = ?, order_index = ? 
            WHERE id = ?`,
      args: [type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks, order_index, id]
    });
    return successResponse(res, null, 'Question updated successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    await client.execute({
      sql: 'DELETE FROM questions WHERE id = ?',
      args: [id]
    });
    return successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const importQuestions = async (req, res) => {
  const { examId } = req.params;
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 'Bad Request', 400);
  }

  try {
    const { imported, failed } = parseExcel(req.file.path);
    
    for (const q of imported) {
      await client.execute({
        sql: `INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [examId, q.type, q.question_text, q.options, q.correct_answer, q.explanation, q.language, q.base_code, q.test_cases, q.marks]
      });
    }

    return successResponse(res, { importedCount: imported.length, failed }, 'Bulk import completed');
  } catch (error) {
    return errorResponse(res, error, 'Import Error');
  }
};

export const bulkAddQuestions = async (req, res) => {
  const { exam_id, questions } = req.body;
  
  if (!Array.isArray(questions)) {
    return errorResponse(res, 'Questions must be an array', 'Bad Request', 400);
  }

  try {
    const results = [];
    for (const q of questions) {
      const result = await client.execute({
        sql: `INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, language, base_code, test_cases, marks, order_index) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          exam_id, 
          q.type || 'mcq', 
          q.question_text || '', 
          q.options || '[]', 
          q.correct_answer || (q.answer || ''), 
          q.explanation || '', 
          q.language || null,
          q.base_code || null,
          q.test_cases || null,
          q.marks || 1, 
          q.order_index || 0
        ]
      });
      results.push(result.lastInsertRowid);
    }
    return successResponse(res, { count: results.length }, 'Bulk questions added successfully', 201);
  } catch (error) {
    console.error('Bulk insert failure:', error);
    return errorResponse(res, error, 'Server Error during bulk operation');
  }
};
