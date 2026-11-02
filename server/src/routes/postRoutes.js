import { Router } from 'express';
import {
  listPosts,
  getPostBySlug,
  adminListPosts,
  adminGetPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
} from '../controllers/postController.js';
import { listComments, addComment } from '../controllers/commentController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Admin routes come first so "/admin/..." is not treated as a slug
router.get('/admin/all', protect, adminOnly, adminListPosts);
router.get('/admin/:id', protect, adminOnly, adminGetPost);

router.get('/', listPosts);
router.post('/', protect, adminOnly, createPost);
router.get('/:slug', optionalAuth, getPostBySlug);
router.put('/:id', protect, adminOnly, updatePost);
router.delete('/:id', protect, adminOnly, deletePost);

router.post('/:id/like', protect, toggleLike);
router.get('/:id/comments', listComments);
router.post('/:id/comments', protect, addComment);

export default router;
