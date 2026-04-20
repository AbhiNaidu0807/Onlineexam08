import client from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { calculateScore } from '../services/scoreService.js';
import { updateLeaderboard } from '../services/leaderboardService.js';
import { createNotification } from './notificationController.js';

export const startAttempt = async (req, res) => {
  const { examId } = req.body;
  const userId = req.user.id;

  try {
    const examRes = await client.execute({ sql: 'SELECT * FROM exams WHERE id = ?', args: [examId] });
    if (examRes.rows.length === 0) return errorResponse(res, 'Exam not found', 'Not Found', 404);
    const exam = examRes.rows[0];

    const checkSql = "SELECT a.*, e.duration FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.user_id = ? AND a.exam_id = ?";
    const existingAttempt = await client.execute({ sql: checkSql, args: [userId, examId] });
    
    if (existingAttempt.rows.length > 0) {
      const attempt = existingAttempt.rows[0];
      if (attempt.status === 'in_progress') {
        const questionsRes = await client.execute({
           sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
           args: [examId]
        });

        const startTime = new Date(attempt.start_time);
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const timeRemaining = (attempt.duration * 60) - elapsed;

        if (timeRemaining > 0) {
           return successResponse(res, {
             attempt_id: String(attempt.id),
             questions: questionsRes.rows.map(q => ({ ...q, id: String(q.id) })),
             time_remaining: timeRemaining,
             status: 'resumed'
           }, 'Resuming active attempt');
        }
      }
      await client.execute({ sql: "DELETE FROM attempts WHERE user_id = ? AND exam_id = ?", args: [userId, examId] });
      await client.execute({ sql: "DELETE FROM retake_permissions WHERE user_id = ? AND exam_id = ?", args: [userId, examId] });
    }

    const result = await client.execute({
      sql: "INSERT INTO attempts (user_id, exam_id, start_time, status) VALUES (?, ?, CURRENT_TIMESTAMP, 'in_progress')",
      args: [userId, examId]
    });
    const attemptId = String(result.lastInsertRowid);

    const questionsRes = await client.execute({
      sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
      args: [examId]
    });

    return successResponse(res, {
      attempt_id: attemptId,
      questions: questionsRes.rows.map(q => ({ ...q, id: String(q.id) })),
      time_remaining: exam.duration * 60
    }, 'Attempt started');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const resumeAttempt = async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;

  try {
    const attemptRes = await client.execute({
      sql: "SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'in_progress'",
      args: [userId, examId]
    });

    if (attemptRes.rows.length === 0) {
      return errorResponse(res, 'No active attempt found', 'Not Found', 404);
    }

    const attempt = attemptRes.rows[0];
    const examRes = await client.execute({ sql: 'SELECT duration FROM exams WHERE id = ?', args: [examId] });
    const exam = examRes.rows[0];

    const startTime = new Date(attempt.start_time);
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const timeRemaining = (exam.duration * 60) - elapsed;

    if (timeRemaining <= 0) {
       return errorResponse(res, 'Attempt time expired', 'Forbidden', 403);
    }

    const questionsRes = await client.execute({
      sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
      args: [examId]
    });

    const answersRes = await client.execute({
      sql: 'SELECT question_id, answer FROM answers WHERE attempt_id = ?',
      args: [attempt.id]
    });

    return successResponse(res, {
      attempt_id: attempt.id.toString(),
      questions: questionsRes.rows.map(q => ({ ...q, id: q.id.toString() })),
      saved_answers: answersRes.rows.map(a => ({ ...a, question_id: a.question_id.toString() })),
      time_remaining: timeRemaining
    }, 'Attempt resumed');
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const submitAttempt = async (req, res) => {
  const { attemptId, answers: bodyAnswers } = req.body;
  
  if (!attemptId) return errorResponse(res, 'Attempt ID required', 'Bad Request', 400);

  try {
    const attemptRes = await client.execute({
      sql: 'SELECT * FROM attempts WHERE id = ?',
      args: [attemptId]
    });
    if (attemptRes.rows.length === 0) return errorResponse(res, 'Attempt not found', 'Not Found', 404);
    const attempt = attemptRes.rows[0];
    
    if (attempt.status === 'submitted') {
       return successResponse(res, { score: attempt.score, totalMarks: attempt.total_marks }, 'Fetched finalized result');
    }

    if (bodyAnswers && typeof bodyAnswers === 'object') {
       for (const [qId, ans] of Object.entries(bodyAnswers)) {
          const finalAns = typeof ans === 'object' ? JSON.stringify(ans) : String(ans);
          await client.execute({
             sql: `INSERT INTO answers (attempt_id, question_id, answer, saved_at) 
                   VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                   ON CONFLICT(attempt_id, question_id) DO UPDATE SET 
                   answer = excluded.answer, 
                   saved_at = CURRENT_TIMESTAMP`,
             args: [parseInt(attemptId), parseInt(qId), finalAns]
          });
       }
    }

    const questionsRes = await client.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ?',
      args: [attempt.exam_id]
    });

    // TASK 6: Single Source of Truth - Evaluate using the incoming answers directly
    // This avoids race conditions where DB might not have finished indexing the newly inserted rows
    const normalizedAnswersForScore = questionsRes.rows.map(q => {
      const bodyAns = bodyAnswers[String(q.id)];
      return {
        question_id: q.id,
        answer: typeof bodyAns === 'object' ? JSON.stringify(bodyAns) : String(bodyAns ?? "")
      };
    });

    const { score, totalMarks, gradedAnswers } = calculateScore(questionsRes.rows, normalizedAnswersForScore);

    // TASK 1: TRACE FULL DATA FLOW LOGGING
    console.group(`[SUBMISSION AUDIT] Attempt ${attemptId}`);
    gradedAnswers.forEach((ga, i) => {
      const q = questionsRes.rows.find(row => row.id === ga.question_id);
      console.log(`Q${i+1} (ID: ${ga.question_id})`);
      console.log(`  Student: "${ga.answer}" (type: ${typeof ga.answer})`);
      console.log(`  Correct: "${ga.correct_answer}" (type: ${typeof ga.correct_answer})`);
      console.log(`  Result: ${ga.is_correct ? 'CORRECT ✅' : 'INCORRECT ❌'}`);
    });
    console.log(`Total Score: ${score}/${totalMarks}`);
    console.groupEnd();

    for (const ga of gradedAnswers) {
      await client.execute({
        sql: `UPDATE answers SET is_correct = ?, marks_awarded = ? 
              WHERE attempt_id = ? AND question_id = ?`,
        args: [ga.is_correct, ga.marks_awarded, attemptId, ga.question_id]
      });
    }

    const startTime = new Date(attempt.start_time);
    const submitTime = new Date();
    const timeTaken = Math.max(0, Math.floor((submitTime - startTime) / 1000));

    await client.execute({
      sql: `UPDATE attempts 
            SET status = 'submitted', submit_time = CURRENT_TIMESTAMP, score = ?, total_marks = ?, time_taken = ? 
            WHERE id = ?`,
      args: [score, totalMarks, timeTaken, attemptId]
    });

    await updateLeaderboard(attempt.exam_id);

    // Notify user
    const examRes = await client.execute({ sql: 'SELECT title FROM exams WHERE id = ?', args: [attempt.exam_id] });
    await createNotification(attempt.user_id, 'RESULT_AVAILABLE', `Result Published: ${examRes.rows[0].title} (${score}/${totalMarks})`);

    return successResponse(res, { score, totalMarks, timeTaken }, 'Attempt submitted successfully');
  } catch (error) {
    console.error('Submission Error:', error);
    return errorResponse(res, error.message || error, 'Server Error');
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const result = await client.execute({
      sql: `SELECT a.*, e.title as exam_title, e.passing_score 
            FROM attempts a 
            JOIN exams e ON a.exam_id = e.id 
            WHERE a.user_id = ? 
            ORDER BY a.start_time DESC`,
      args: [req.user.id]
    });
    return successResponse(res, result.rows.map(row => ({
      ...row,
      id: row.id.toString(),
      user_id: row.user_id.toString(),
      exam_id: row.exam_id.toString()
    })));
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};

export const getAttemptResult = async (req, res) => {
  const { id } = req.params;
  try {
    const attemptRes = await client.execute({ sql: 'SELECT * FROM attempts WHERE id = ?', args: [id] });
    if (attemptRes.rows.length === 0) return errorResponse(res, 'Attempt not found', 'Not Found', 404);
    const attempt = attemptRes.rows[0];

    const examRes = await client.execute({ sql: 'SELECT * FROM exams WHERE id = ?', args: [attempt.exam_id] });
    const exam = examRes.rows[0];

    const questionsRes = await client.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ?',
      args: [attempt.exam_id]
    });

    const answersRes = await client.execute({
      sql: `SELECT a.*, q.question_text, q.correct_answer, q.explanation, q.marks, q.type 
            FROM answers a JOIN questions q ON a.question_id = q.id 
            WHERE a.attempt_id = ?`,
      args: [id]
    });

    // SILENT RE-GRADING: Always use the latest scoring engine logic
    const { score, gradedAnswers } = calculateScore(questionsRes.rows, answersRes.rows);
    
    // Update attempt if score differs (due to logic updates)
    if (score !== attempt.score) {
      await client.execute({
        sql: 'UPDATE attempts SET score = ? WHERE id = ?',
        args: [score, id]
      });
      attempt.score = score;
    }

    // Sync answers table with re-graded results
    for (const ga of gradedAnswers) {
      await client.execute({
        sql: 'UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE attempt_id = ? AND question_id = ?',
        args: [ga.is_correct, ga.marks_awarded, id, ga.question_id]
      });
    }

    return successResponse(res, {
      attempt: { ...attempt, score, total_marks: totalMarks, id: attempt.id.toString() },
      exam: { ...exam, id: exam.id.toString() },
      answers: gradedAnswers.map(ga => {
        // Find matching row for metadata (question text, etc.)
        const a = answersRes.rows.find(row => String(row.question_id) === String(ga.question_id));
        return {
           ...a,
           ...ga,
           id: a ? a.id.toString() : `virtual-${ga.question_id}`,
           is_correct: ga.is_correct // TRUST THE SCORING ENGINE
        };
      })
    });
  } catch (error) {
    return errorResponse(res, error, 'Server Error');
  }
};
