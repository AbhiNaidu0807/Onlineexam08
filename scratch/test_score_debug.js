import { calculateScore } from '../backend/services/scoreService.js';

const questions = [
  {
    id: 1,
    type: 'TEXT',
    question_text: 'add 34 +30=?',
    correct_answer: '64',
    marks: 1
  }
];

const answers = [
  {
    question_id: 1,
    answer: '64'
  }
];

const result = calculateScore(questions, answers);
console.log('Result:', JSON.stringify(result, null, 2));

if (result.gradedAnswers[0].is_correct === 1) {
  console.log('Test PASSED: 64 matches 64');
} else {
  console.log('Test FAILED: 64 did not match 64');
}

const answers2 = [
  {
    question_id: 1,
    answer: ' 64  '
  }
];

const result2 = calculateScore(questions, answers2);
if (result2.gradedAnswers[0].is_correct === 1) {
  console.log('Test PASSED: " 64  " matches 64');
} else {
  console.log('Test FAILED: " 64  " did not match 64');
}
