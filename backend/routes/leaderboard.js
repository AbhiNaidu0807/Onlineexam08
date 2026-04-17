import express from 'express';
import { getLeaderboard } from '../controllers/leaderboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:examId', getLeaderboard);

export default router;
