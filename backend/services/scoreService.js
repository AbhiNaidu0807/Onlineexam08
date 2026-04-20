/**
 * INSTITUTIONAL GRADE SCORING ENGINE (EMERGENCY REPAIR VERSION)
 * 100% Fail-safe logic as requested by systems audit.
 */

export function compareAnswers(a, b) {
  // Task 6: Safe Compare Function
  const x = String(a ?? "").trim().toLowerCase();
  const y = String(b ?? "").trim().toLowerCase();

  // Task 1: Trace Full Data Flow Logging (Server Side)
  console.log(`[EVALUATION] Comparing: "${x}" vs "${y}"`);

  const bothNum = !isNaN(x) && x !== "" && !isNaN(y) && y !== "";

  if (bothNum) {
    const isNumMatch = Number(x) === Number(y);
    console.log(`  Numeric Match: ${isNumMatch}`);
    return isNumMatch;
  }

  const isTextMatch = x === y;
  console.log(`  Text Match: ${isTextMatch}`);
  return isTextMatch;
}

export const calculateScore = (questions = [], answers = []) => {
  let score = 0;
  let totalMarks = 0;
  const gradedAnswers = [];

  // Build a clean lookup map for student answers
  const submissionMap = {};
  answers.forEach(a => {
    if (a.question_id) {
      submissionMap[String(a.question_id)] = a.answer;
    }
  });

  // Task 5: Rebuild Result Array Correctly
  for (const q of questions) {
    const qId = String(q.id);
    const qMarks = Number(q.marks) || 0;
    totalMarks += qMarks;

    const student = submissionMap[qId] ?? "";
    const key = q.correct_answer || q.correctAnswer || "";

    const isCorrect = compareAnswers(student, key);

    // Task 9: Debug Log Each Question (Server Side)
    console.log({
      id: qId,
      student,
      key,
      compared: isCorrect,
      final: isCorrect ? 1 : 0
    });

    const marksAwarded = isCorrect ? qMarks : 0;
    score += marksAwarded;

    gradedAnswers.push({
      question_id: q.id,
      answer: student,
      correct_answer: key,
      is_correct: isCorrect ? 1 : 0, // Store as 1/0 for SQL compatibility
      marks_awarded: marksAwarded
    });
  }

  return { score, totalMarks, gradedAnswers };
};