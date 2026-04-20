import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { calculateScore } from './services/scoreService.js';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function inspect() {
  try {
    const attemptId = 63;
    console.log(`Inspecting Attempt ID: ${attemptId}`);

    const attemptRes = await client.execute({
      sql: 'SELECT * FROM attempts WHERE id = ?',
      args: [attemptId]
    });
    
    const answersRes = await client.execute({
      sql: 'SELECT * FROM answers WHERE attempt_id = ?',
      args: [attemptId]
    });

    const examId = attemptRes.rows[0].exam_id;
    const questionsRes = await client.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ?',
      args: [examId]
    });

    console.log('\n--- Running calculateScore on Real Data ---');
    const result = calculateScore(questionsRes.rows, answersRes.rows);
    
    result.gradedAnswers.forEach((ga, i) => {
        console.log(`Q${i+1} (ID: ${ga.question_id}):`);
        console.log(`  Student: "${ga.answer}"`);
        console.log(`  Correct: "${questionsRes.rows.find(q => q.id === ga.question_id).correct_answer}"`);
        console.log(`  Is Correct: ${ga.is_correct === 1 ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

inspect();
