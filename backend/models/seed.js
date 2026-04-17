import bcrypt from 'bcryptjs';
import client from '../config/db.js';

export const seedData = async () => {
  try {
    const usersCount = await client.execute('SELECT COUNT(*) as count FROM users');
    if (usersCount.rows[0].count > 0) {
      console.log('Database already seeded');
      return;
    }

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const alicePassword = await bcrypt.hash('Alice@123', 10);
    const bobPassword = await bcrypt.hash('Bob@123', 10);

    // Insert Users
    await client.execute({
      sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      args: ['Admin User', 'admin@quizapp.com', adminPassword, 'admin'],
    });
    await client.execute({
      sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      args: ['Alice Johnson', 'alice@student.com', alicePassword, 'student'],
    });
    await client.execute({
      sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      args: ['Bob Smith', 'bob@student.com', bobPassword, 'student'],
    });

    // Create Sample Exams
    const exam1Results = await client.execute({
      sql: `INSERT INTO exams (title, duration, passing_score, start_time, end_time, is_published, created_by) 
            VALUES (?, ?, ?, datetime('now', '-1 hour'), datetime('now', '+24 hours'), 1, 1)`,
      args: ['Full-Stack Web Development Quiz', 30, 60],
    });
    const exam1Id = exam1Results.lastInsertRowid;

    const exam2Results = await client.execute({
      sql: `INSERT INTO exams (title, duration, passing_score, start_time, end_time, is_published, created_by) 
            VALUES (?, ?, ?, datetime('now', '-1 hour'), datetime('now', '+24 hours'), 1, 1)`,
      args: ['JavaScript Algorithms & Logic', 45, 70],
    });
    const exam2Id = exam2Results.lastInsertRowid;

    // Questions for Exam 1
    const questions1 = [
      ['MCQ', 'What does CSS stand for?', JSON.stringify(['Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets']), 'Cascading Style Sheets', 'CSS stands for Cascading Style Sheets.', 2, 1],
      ['MCQ', 'Which HTML element is used for the largest heading?', JSON.stringify(['<h1>', '<h6>', '<head>']), '<h1>', 'H1 is the largest heading.', 2, 2],
      ['SHORT', 'What is the full form of HTTP?', null, 'Hypertext Transfer Protocol', 'HTTP stands for Hypertext Transfer Protocol.', 5, 3],
      ['CODING', 'Write a function named "add" that returns the sum of two numbers.', null, 'function add(a, b) { return a + b; }', 'Basic function declaration.', 10, 4],
      ['MCQ', 'Which tag is used to create a hyperlink?', JSON.stringify(['<a>', '<img>', '<hr>']), '<a>', 'The <a> tag defines a hyperlink.', 2, 5],
    ];

    for (const q of questions1) {
      await client.execute({
        sql: 'INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, marks, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [exam1Id, ...q],
      });
    }

    // Questions for Exam 2
    const questions2 = [
      ['MCQ', 'What is the output of "2" + 2?', JSON.stringify(['"22"', '4', 'NaN']), '"22"', 'String concatenation occurs.', 2, 1],
      ['SHORT', 'Which keyword is used to declare a block-scoped variable?', null, 'let', 'let and const are block-scoped.', 3, 2],
      ['CODING', 'Write a function to find the factorial of a number.', null, 'function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }', 'Recursive factorial implementation.', 15, 3],
      ['MCQ', 'Which method is used to add an element to the end of an array?', JSON.stringify(['push()', 'pop()', 'shift()']), 'push()', 'push() adds to the end.', 2, 4],
      ['SHORT', 'What is the result of typeof NaN?', null, 'number', 'NaN is a numeric type.', 5, 5],
    ];

    for (const q of questions2) {
      await client.execute({
        sql: 'INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, marks, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [exam2Id, ...q],
      });
    }

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
