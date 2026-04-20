import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

function toHex(str) {
    return Array.from(str).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}

async function inspect() {
  try {
    const attemptId = 63;
    const answersRes = await client.execute({
      sql: 'SELECT a.answer, q.correct_answer, q.id as qid FROM answers a JOIN questions q ON a.question_id = q.id WHERE a.attempt_id = ?',
      args: [attemptId]
    });

    for (const row of answersRes.rows) {
        console.log(`Question ID: ${row.qid}`);
        console.log(`  Student Answer: "${row.answer}" (Hex: ${toHex(String(row.answer))})`);
        console.log(`  Correct Answer: "${row.correct_answer}" (Hex: ${toHex(String(row.correct_answer))})`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

inspect();
