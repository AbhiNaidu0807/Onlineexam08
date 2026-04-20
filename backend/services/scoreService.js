/**
 * INSTITUTIONAL GRADE SCORING ENGINE (STABILITY HARDENED)
 * 100% Fail-safe logic. No null pointer exceptions permitted.
 */

export function compareAnswers(a, b) {
  try {
    const x = String(a ?? "").trim().toLowerCase();
    const y = String(b ?? "").trim().toLowerCase();

    // Check for JSON-encoded answers (e.g. multiple options)
    let parsedX = x;
    try { if (x.startsWith('[') || x.startsWith('{')) parsedX = JSON.parse(x); } catch(e) {}
    
    let parsedY = y;
    try { if (y.startsWith('[') || y.startsWith('{')) parsedY = JSON.parse(y); } catch(e) {}

    // If both are arrays, check if all elements match
    if (Array.isArray(parsedX) && Array.isArray(parsedY)) {
      if (parsedX.length !== parsedY.length) return false;
      const sortedX = [...parsedX].map(v => String(v).trim().toLowerCase()).sort();
      const sortedY = [...parsedY].map(v => String(v).trim().toLowerCase()).sort();
      return sortedX.every((val, index) => val === sortedY[index]);
    }

    // Normal comparison
    const xStr = Array.isArray(parsedX) ? String(parsedX[0] || "") : String(parsedX);
    const yStr = Array.isArray(parsedY) ? String(parsedY[0] || "") : String(parsedY);

    const nx = xStr.trim().toLowerCase();
    const ny = yStr.trim().toLowerCase();

    const bothNum = !isNaN(nx) && nx !== "" && !isNaN(ny) && ny !== "";
    if (bothNum) return Number(nx) === Number(ny);
    
    return nx === ny;
  } catch (err) {
    console.error("[SCORING ENGINE] Compare Crash:", err);
    return false;
  }
}

export const calculateScore = (questions = [], answers = []) => {
  let score = 0;
  let totalMarks = 0;
  const gradedAnswers = [];

  try {
    const questionsArr = Array.isArray(questions) ? questions : [];
    const answersArr = Array.isArray(answers) ? answers : [];

    const submissionMap = {};
    answersArr.forEach(a => {
      if (a && a.question_id) {
        submissionMap[String(a.question_id)] = a.answer;
      }
    });

    for (const q of questionsArr) {
      if (!q || !q.id) continue;
      
      const qId = String(q.id);
      const qMarks = Number(q.marks) || 0;
      totalMarks += qMarks;

      const student = submissionMap[qId] ?? "";
      const key = q.correct_answer || q.correctAnswer || "";

      const isCorrect = compareAnswers(student, key);
      const marksAwarded = isCorrect ? qMarks : 0;
      score += marksAwarded;

      gradedAnswers.push({
        question_id: q.id,
        answer: student,
        correct_answer: key,
        is_correct: isCorrect ? 1 : 0,
        marks_awarded: marksAwarded
      });
    }
  } catch (err) {
    console.error("[SCORING ENGINE] Calculate Crash:", err);
  }

  return { score, totalMarks, gradedAnswers };
};