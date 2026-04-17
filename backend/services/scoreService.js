/**
 * INSTITUTIONAL GRADE SCORING ENGINE
 * Ultra-robust normalization for assessment synchronization
 */

function normalize(answer) {
  if (answer === null || answer === undefined) return "";
  
  return answer
    .toString()
    // Strip HTML tags if any
    .replace(/<[^>]*>/g, '')
    // Replace all whitespace variants (tabs, newlines, non-breaking spaces) with a single space
    .replace(/\s+/g, " ")
    // Remove non-printable characters and other hidden control codes
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Super Matching: Strips ALL characters that aren't letters or numbers.
 * This is the ultimate fallback for accidental encoding issues.
 */
function superStrike(text) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export const calculateScore = (questions, answers) => {
  let score = 0;
  let totalMarks = 0;
  const gradedAnswers = [];

  // Create lookup for performance
  const answerMap = new Map();
  answers.forEach(a => {
    const qid = (a.question_id !== undefined && a.question_id !== null) ? String(a.question_id) : null;
    if (qid) answerMap.set(qid, a);
  });

  for (const question of questions) {
    const qMarks = Number(question.marks) || 0;
    totalMarks += qMarks;
    
    const userAnswer = answerMap.get(String(question.id));
    const studentRaw = userAnswer ? String(userAnswer.answer || '') : '';
    const correctRaw = String(question.correct_answer || '');
    
    let isCorrect = 0;
    let marksAwarded = 0;

    const sNorm = normalize(studentRaw);
    const cNorm = normalize(correctRaw);

    if (sNorm && cNorm) {
      if (question.type === 'MCQ' || question.type === 'SHORT') {
        // First Level: Normalized Equality
        if (sNorm === cNorm) {
          isCorrect = 1;
          marksAwarded = qMarks;
        } 
        // Second Level: Super-Strike Equality (Absolute fallback for hidden chars)
        else if (superStrike(sNorm) === superStrike(cNorm) && superStrike(sNorm).length > 0) {
          isCorrect = 1;
          marksAwarded = qMarks;
        }
        // Third Level: Partial credit for SHORT answers
        else if (question.type === 'SHORT' && sNorm.length > 3 && cNorm.includes(sNorm)) {
          marksAwarded = Math.floor(qMarks * 0.5);
        }
      } else if (question.type === 'CODING') {
        const expected = superStrike(cNorm).split(""); // Token based density check
        const actual = superStrike(sNorm);
        let matches = 0;
        const tokens = cNorm.split(/[ (){}[\]=;,.+-/*%]/).filter(p => p.length > 2);
        for (const t of tokens) {
           if (sNorm.includes(t)) matches++;
        }
        const matchRatio = matches / (tokens.length || 1);
        if (matchRatio >= 0.8) {
          isCorrect = 1;
          marksAwarded = qMarks;
        } else if (matchRatio >= 0.4) {
          marksAwarded = Math.floor(qMarks * 0.5);
        }
      }
    }

    score += marksAwarded;
    gradedAnswers.push({
      question_id: question.id,
      answer: studentRaw,
      is_correct: isCorrect,
      marks_awarded: marksAwarded
    });
  }

  return { score, totalMarks, gradedAnswers };
};
