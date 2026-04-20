import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
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
    
    if (attemptRes.rows.length === 0) {
        console.log('Attempt 63 not found');
        return;
    }
    
    console.log('Attempt:', JSON.stringify(attemptRes.rows[0], null, 2));

    const answersRes = await client.execute({
      sql: 'SELECT * FROM answers WHERE attempt_id = ?',
      args: [attemptId]
    });
    console.log('Answers:', JSON.stringify(answersRes.rows, null, 2));

    const examId = attemptRes.rows[0].exam_id;
    const questionsRes = await client.execute({
      sql: 'SELECT * FROM questions WHERE exam_id = ?',
      args: [examId]
    });
    console.log('Questions:', JSON.stringify(questionsRes.rows, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

inspect();
