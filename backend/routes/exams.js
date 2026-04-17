import express from 'express';
import { getExams, createExam, getExamById, updateExam, deleteExam, publishExam, getExamResults } from '../controllers/examController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getExams);
router.post('/', requireAdmin, createExam);
router.get('/:id', getExamById);
router.put('/:id', requireAdmin, updateExam);
router.delete('/:id', requireAdmin, deleteExam);
router.post('/:id/publish', requireAdmin, publishExam);
router.get('/:id/results', requireAdmin, getExamResults);

export default router;
