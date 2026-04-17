import client from '../config/db.js';

export const createTables = async () => {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        profile_photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        duration INTEGER NOT NULL,
        passing_score INTEGER NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        is_published INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        language TEXT,
        base_code TEXT,
        test_cases TEXT,
        marks INTEGER NOT NULL DEFAULT 1,
        order_index INTEGER DEFAULT 0
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        exam_id INTEGER NOT NULL REFERENCES exams(id),
        start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        submit_time DATETIME,
        auto_submitted INTEGER DEFAULT 0,
        status TEXT DEFAULT 'in_progress',
        score INTEGER,
        total_marks INTEGER,
        UNIQUE(user_id, exam_id)
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL REFERENCES questions(id),
        answer TEXT,
        is_correct INTEGER DEFAULT 0,
        marks_awarded INTEGER DEFAULT 0,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(attempt_id, question_id)
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL REFERENCES exams(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        score INTEGER NOT NULL,
        total_marks INTEGER NOT NULL,
        time_taken INTEGER NOT NULL,
        submit_time DATETIME NOT NULL,
        rank INTEGER,
        UNIQUE(exam_id, user_id)
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS retake_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        exam_id INTEGER NOT NULL REFERENCES exams(id),
        granted_by INTEGER REFERENCES users(id),
        granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, exam_id)
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: Add columns to questions if they don't exist (CREATE TABLE IF NOT EXISTS doesn't update schema)
    const columnsToAdd = [
      { name: 'language', type: 'TEXT' },
      { name: 'base_code', type: 'TEXT' },
      { name: 'test_cases', type: 'TEXT' }
    ];

    for (const col of columnsToAdd) {
      try {
        await client.execute(`ALTER TABLE questions ADD COLUMN ${col.name} ${col.type}`);
      } catch (e) {}
    }

    try {
      await client.execute(`ALTER TABLE attempts ADD COLUMN time_taken INTEGER`);
    } catch (e) {}

    // Indexes
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_questions_exam ON questions(exam_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_attempts_exam ON attempts(exam_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_leaderboard_exam ON leaderboard(exam_id)`);

    console.log('Tables and indexes created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};
