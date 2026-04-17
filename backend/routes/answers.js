import express from 'express';
import { saveAnswer } from '../controllers/answerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/save', saveAnswer);

export default router;
