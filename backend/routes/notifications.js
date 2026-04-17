import express from 'express';
import { getNotifications, markAsRead, clearNotifications } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', getNotifications);
router.post('/read', markAsRead);
router.delete('/clear', clearNotifications);

export default router;
