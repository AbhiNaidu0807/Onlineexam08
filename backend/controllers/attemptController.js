import client, { executeWithRetry } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { calculateScore } from '../services/scoreService.js';
import { updateLeaderboard } from '../services/leaderboardService.js';
import { createNotification } from './notificationController.js';

/**
 * MISSION HARDENED UTILITIES
 */
const normalize = (v) =>
  String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const isNumber = (v) => v !== "" && !isNaN(Number(v));

function isCorrectCompare(submitted, correct) {
  const s = normalize(submitted);
  const c = normalize(correct);
  if (isNumber(s) && isNumber(c)) return Number(s) === Number(c);
  return s === c;
}

export const startAttempt = async (req, res) => {
  const { examId } = req.body;
  const userId = req.user.id;
  try {
    const examRes = await executeWithRetry({ sql: 'SELECT * FROM exams WHERE id = ?', args: [examId] });
    if (examRes.rows.length === 0) return errorResponse(res, 'Exam not found', 'Not Found', 404);
    const exam = examRes.rows[0];
    const checkSql = "SELECT a.*, e.duration FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.user_id = ? AND a.exam_id = ?";
    const existingAttempt = await executeWithRetry({ sql: checkSql, args: [userId, examId] });
    if (existingAttempt.rows.length > 0) {
      const attempt = existingAttempt.rows[0];
      if (attempt.status === 'in_progress') {
        const questionsRes = await executeWithRetry({
           sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC',
           args: [examId]
        });
        const startTime = new Date(attempt.start_time);
        const elapsed = Math.floor((new Date() - startTime) / 1000);
        const timeRemaining = (attempt.duration * 60) - elapsed;
        if (timeRemaining > 0) {
           return successResponse(res, { attempt_id: String(attempt.id), questions: questionsRes.rows.map(q => ({ ...q, id: String(q.id) })), time_remaining: timeRemaining, status: 'resumed' }, 'Resuming active attempt');
        }
      }
      await executeWithRetry({ sql: "DELETE FROM attempts WHERE user_id = ? AND exam_id = ?", args: [userId, examId] });
      await executeWithRetry({ sql: "DELETE FROM retake_permissions WHERE user_id = ? AND exam_id = ?", args: [userId, examId] });
    }
    const result = await executeWithRetry({ sql: "INSERT INTO attempts (user_id, exam_id, start_time, status) VALUES (?, ?, CURRENT_TIMESTAMP, 'in_progress')", args: [userId, examId] });
    const attemptId = String(result.lastInsertRowid);
    const questionsRes = await executeWithRetry({ sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC', args: [examId] });
    return successResponse(res, { attempt_id: attemptId, questions: questionsRes.rows.map(q => ({ ...q, id: String(q.id) })), time_remaining: exam.duration * 60 }, 'Attempt started');
  } catch (error) { return errorResponse(res, error, 'Start Attempt Failure'); }
};

export const resumeAttempt = async (req, res) => {
  const { examId } = req.params;
  const userId = req.user.id;
  try {
    const attemptRes = await executeWithRetry({ sql: "SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = 'in_progress'", args: [userId, examId] });
    if (attemptRes.rows.length === 0) return errorResponse(res, 'No active attempt found', 'Not Found', 404);
    const attempt = attemptRes.rows[0];
    const examRes = await executeWithRetry({ sql: 'SELECT duration FROM exams WHERE id = ?', args: [examId] });
    const exam = examRes.rows[0];
    const startTime = new Date(attempt.start_time);
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const timeRemaining = (exam.duration * 60) - elapsed;
    if (timeRemaining <= 0) return errorResponse(res, 'Attempt time expired', 'Forbidden', 403);
    const questionsRes = await executeWithRetry({ sql: 'SELECT id, type, question_text, options, marks, order_index FROM questions WHERE exam_id = ? ORDER BY order_index ASC', args: [examId] });
    const answersRes = await executeWithRetry({ sql: 'SELECT question_id, answer FROM answers WHERE attempt_id = ?', args: [attempt.id] });
    return successResponse(res, { attempt_id: attempt.id.toString(), questions: questionsRes.rows.map(q => ({ ...q, id: q.id.toString() })), saved_answers: answersRes.rows.map(a => ({ ...a, question_id: a.question_id.toString() })), time_remaining: timeRemaining }, 'Attempt resumed');
  } catch (error) { return errorResponse(res, error, 'Resume Attempt Failure'); }
};

export const submitAttempt = async (req, res) => {
  const { attemptId, answers: bodyAnswers } = req.body;
  if (!attemptId) return errorResponse(res, 'Attempt ID required', 'Bad Request', 400);
  try {
    const attemptRes = await executeWithRetry({ sql: 'SELECT * FROM attempts WHERE id = ?', args: [attemptId] });
    if (attemptRes.rows.length === 0) return errorResponse(res, 'Attempt not found', 'Not Found', 404);
    const attempt = attemptRes.rows[0];
    if (attempt.status === 'submitted') return successResponse(res, { score: attempt.score, totalMarks: attempt.total_marks }, 'Fetched finalized result');
    if (bodyAnswers && typeof bodyAnswers === 'object') {
       for (const [qId, ans] of Object.entries(bodyAnswers)) {
          const finalAns = typeof ans === 'object' ? JSON.stringify(ans) : String(ans);
          await executeWithRetry({ sql: `INSERT INTO answers (attempt_id, question_id, answer, saved_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(attempt_id, question_id) DO UPDATE SET answer = excluded.answer, saved_at = CURRENT_TIMESTAMP`, args: [parseInt(attemptId), parseInt(qId), finalAns] });
       }
    }
    const questionsRes = await executeWithRetry({ sql: 'SELECT * FROM questions WHERE exam_id = ?', args: [attempt.exam_id] });
    const normalizedAnswersForScore = questionsRes.rows.map(q => {
      const bodyAns = bodyAnswers ? bodyAnswers[String(q.id)] : undefined;
      return { question_id: q.id, answer: typeof bodyAns === 'object' ? JSON.stringify(bodyAns) : String(bodyAns ?? "") };
    });
    const { score, totalMarks, gradedAnswers } = calculateScore(questionsRes.rows, normalizedAnswersForScore);
    for (const ga of gradedAnswers) {
      await executeWithRetry({ sql: `UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE attempt_id = ? AND question_id = ?`, args: [ga.is_correct, ga.marks_awarded, attemptId, ga.question_id] });
    }
    const startTime = new Date(attempt.start_time);
    const timeTaken = Math.max(0, Math.floor((new Date() - startTime) / 1000));
    await executeWithRetry({ sql: `UPDATE attempts SET status = 'submitted', submit_time = CURRENT_TIMESTAMP, score = ?, total_marks = ?, time_taken = ? WHERE id = ?`, args: [score, totalMarks, timeTaken, attemptId] });
    await updateLeaderboard(attempt.exam_id);
    const examRes = await executeWithRetry({ sql: 'SELECT title FROM exams WHERE id = ?', args: [attempt.exam_id] });
    await createNotification(attempt.user_id, 'RESULT_AVAILABLE', `Result Published: ${examRes.rows[0].title} (${score}/${totalMarks})`);
    return successResponse(res, { score, totalMarks, timeTaken }, 'Attempt submitted successfully');
  } catch (error) { return errorResponse(res, error, 'Submission Finalization Failure'); }
};

export const getMyAttempts = async (req, res) => {
  try {
    const result = await executeWithRetry({ sql: `SELECT a.*, e.title as exam_title, e.passing_score FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.user_id = ? ORDER BY a.start_time DESC`, args: [req.user.id] });
    return successResponse(res, result.rows.map(row => ({ ...row, id: row.id.toString(), user_id: row.user_id.toString(), exam_id: row.exam_id.toString() })));
  } catch (error) { return errorResponse(res, error, 'Fetch History Failure'); }
};

/**
 * PRODUCTION-READY RESULT ENGINE (ULTRA STABLE)
 */
export const getAttemptResult = async (req, res) => {
  const id = req.params.id;
  
  // STEP 1: TRACE API
  console.log("RESULT API HIT", id);
  
  // STEP 2: ADD FULL ERROR LOGGING
  try {
    console.log("Fetching Result for Attempt ID:", id);
    
    // 1. Fetch data with defensive checks
    const attemptRes = await executeWithRetry({ 
      sql: 'SELECT * FROM attempts WHERE id = ?', 
      args: [id] 
    });

    if (attemptRes.rows.length === 0) {
      console.warn("RESULT_NOT_FOUND:", id);
      return res.status(404).json({
        success: false,
        message: "Result not found"
      });
    }

    const attempt = attemptRes.rows[0];

    // 2. Fetch related data
    const [questionsRes, answersRes] = await Promise.all([
      executeWithRetry({ 
        sql: 'SELECT * FROM questions WHERE exam_id = ?', 
        args: [attempt.exam_id] 
      }),
      executeWithRetry({ 
        sql: 'SELECT * FROM answers WHERE attempt_id = ?', 
        args: [id] 
      })
    ]);

    // 3. VALIDATE DATA BEFORE PROCESSING
    let questions = Array.isArray(questionsRes.rows) ? questionsRes.rows : [];
    let answers = Array.isArray(answersRes.rows) ? answersRes.rows : [];

    console.log("Questions Count:", questions.length);
    console.log("Answers Count:", answers.length);

    const gradedAnswers = [];
    let score = 0;
    let totalMarks = 0;

    const normalize = (v) =>
      String(v ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const isNumber = (v) => v !== "" && !isNaN(Number(v));

    function checkCorrect(s_val, c_val) {
      const s = normalize(s_val);
      const c = normalize(c_val);
      if (isNumber(s) && isNumber(c)) {
        return Number(s) === Number(c);
      }
      return s === c;
    }

    // 4. SAFE LOOP (NO BREAKING)
    for (const question of questions) {
      try {
        const qId = String(question.id);
        const marks = Number(question.marks) || 0;
        totalMarks += marks;

        // A. FIND USER ANSWER
        const userAnswer = answers.find(a => String(a.question_id) === qId);

        // B. FIX NULL VALUES & TYPE SAFETY
        const submitted = userAnswer?.answer ?? "";
        const correct = question?.correct_answer ?? "";

        // C. SAFE JSON PARSE
        let options = [];
        try {
          options = JSON.parse(question.options || "[]");
          if (!Array.isArray(options)) options = [];
        } catch (e) {
          console.warn("OPTIONS_PARSE_ERROR for question:", qId);
          options = [];
        }

        let isCorrectFlag = checkCorrect(submitted, correct);

        // F. MCQ FALLBACK LOGIC
        if (!isCorrectFlag && String(question.type || "").toUpperCase() === "MCQ") {
          const s = normalize(submitted);
          const c = normalize(correct);

          // If student provided letter (a, b, c, d)
          if (/^[a-d]$/.test(s)) {
            const index = s.charCodeAt(0) - 97;
            if (options[index] && normalize(options[index]) === c) {
              isCorrectFlag = true;
            }
          }
          
          // If correct answer in DB is letter (a, b, c, d)
          if (!isCorrectFlag && /^[a-d]$/.test(c)) {
            const index = c.charCodeAt(0) - 97;
            if (options[index] && normalize(options[index]) === s) {
              isCorrectFlag = true;
            }
          }
        }

        const marksAwarded = isCorrectFlag ? marks : 0;
        if (isCorrectFlag) score += marksAwarded;

        gradedAnswers.push({
          question_text: question.question_text || "Question",
          studentAnswer: submitted,
          correctAnswer: correct,
          isCorrect: isCorrectFlag,
          marks: marks,
          marks_awarded: marksAwarded,
          explanation: question.explanation || ""
        });

      } catch (err) {
        console.error("QUESTION EVALUATION FAILED:", question.id, err);
        gradedAnswers.push({
          question_text: question.question_text || "Error processing question",
          studentAnswer: "N/A",
          correctAnswer: "N/A",
          isCorrect: false,
          marks: Number(question.marks) || 0,
          marks_awarded: 0,
          explanation: "Processing Error"
        });
      }
    }

    // 5. CALCULATE STATS
    const examRes = await executeWithRetry({ 
      sql: 'SELECT * FROM exams WHERE id = ?', 
      args: [attempt.exam_id] 
    });
    const exam = examRes.rows[0] || {};
    
    const percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    const status = percentage >= (exam.passing_score || 35) ? "PASS" : "FAIL";

    // 6. FINAL RESPONSE FORMAT
    return res.json({
      success: true,
      score,
      totalMarks,
      percentage,
      status,
      gradedAnswers,
      attemptId: id,
      exam: {
        id: attempt.exam_id,
        title: exam.title || "Examination"
      }
    });

  } catch (err) {
    // STEP 2: 🔥 RESULT CRASH
    console.error("🔥 RESULT CRASH:", err.stack);
    return res.status(500).json({
      success: false,
      message: "Result processing failed",
      error: err.message,
      stack: err.stack
    });
  }
};
