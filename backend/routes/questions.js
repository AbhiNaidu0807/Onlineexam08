import express from 'express';
import multer from 'multer';
import { getQuestionsByExam, addQuestion, updateQuestion, deleteQuestion, importQuestions, bulkAddQuestions } from '../controllers/questionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authMiddleware);

router.get('/exam/:examId', getQuestionsByExam);
router.post('/', requireAdmin, addQuestion);
router.put('/:id', requireAdmin, updateQuestion);
router.delete('/:id', requireAdmin, deleteQuestion);
router.post('/bulk', requireAdmin, bulkAddQuestions);
router.post('/import/:examId', requireAdmin, upload.single('file'), importQuestions);

export default router;
