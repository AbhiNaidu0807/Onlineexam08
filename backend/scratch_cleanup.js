import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import client from './config/db.js';

async function findAndDelete() {
  try {
    const res = await client.execute("SELECT id, title FROM exams WHERE title LIKE '%Full-Stack%'");
    console.log('Found:', res.rows);
    if (res.rows.length > 0) {
      for (const row of res.rows) {
        console.log('Deleting ID:', row.id);
        // Cascading removals for DB integrity
        await client.execute({ sql: "DELETE FROM retake_permissions WHERE exam_id = ?", args: [row.id] });
        await client.execute({ sql: "DELETE FROM leaderboard WHERE exam_id = ?", args: [row.id] });
        await client.execute({ sql: "DELETE FROM answers WHERE attempt_id IN (SELECT id FROM attempts WHERE exam_id = ?)", args: [row.id] });
        await client.execute({ sql: "DELETE FROM attempts WHERE exam_id = ?", args: [row.id] });
        await client.execute({ sql: "DELETE FROM questions WHERE exam_id = ?", args: [row.id] });
        await client.execute({ sql: "DELETE FROM exams WHERE id = ?", args: [row.id] });
      }
      console.log('SUCCESS: Removed all associated data.');
    } else {
      console.log('No matching exam found.');
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}

findAndDelete();
