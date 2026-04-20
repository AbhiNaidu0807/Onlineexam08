import express from 'express';
import { 
  getProfile, 
  updateProfile, 
  uploadAvatar, 
  removeAvatar, 
  changePassword 
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', authMiddleware, removeAvatar);
router.put('/change-password', authMiddleware, changePassword);

export default router;
