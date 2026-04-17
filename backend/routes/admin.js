import express from 'express';
import { getAdminDashboard, getAllStudents, grantRetake, gradeAnswer } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/students', getAllStudents);
router.post('/grant-retake', grantRetake);
router.post('/grade-answer', gradeAnswer);

export default router;
