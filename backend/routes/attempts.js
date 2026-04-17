import express from 'express';
import { startAttempt, resumeAttempt, submitAttempt, getMyAttempts, getAttemptResult } from '../controllers/attemptController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/start', startAttempt);
router.get('/resume/:examId', resumeAttempt);
router.post('/submit', submitAttempt);
router.get('/my', getMyAttempts);
router.get('/result/:id', getAttemptResult);

export default router;
