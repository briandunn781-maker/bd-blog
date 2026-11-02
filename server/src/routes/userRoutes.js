import { Router } from 'express';
import { toggleBookmark, listBookmarks } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/bookmarks', protect, listBookmarks);
router.post('/bookmarks/:postId', protect, toggleBookmark);

export default router;
