import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', globalSearch);

export default router;
