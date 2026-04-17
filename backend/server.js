import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createTables } from './models/schema.js';
import { seedData } from './models/seed.js';
import { startTimerService } from './services/timerService.js';
import authRoutes from './routes/auth.js';
import examRoutes from './routes/exams.js';
import questionRoutes from './routes/questions.js';
import attemptRoutes from './routes/attempts.js';
import answerRoutes from './routes/answers.js';
import leaderboardRoutes from './routes/leaderboard.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js';
import notificationRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler
app.use(errorHandler);

// Initialization
const init = async () => {
  try {
    await createTables();
    await seedData();
    startTimerService();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

init();
