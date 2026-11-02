import { z } from 'zod';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import HttpError from '../utils/httpError.js';

const commentSchema = z.object({
  body: z.string().trim().min(1, 'Comment cannot be empty').max(2000),
});

// GET /api/posts/:id/comments
export async function listComments(req, res) {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatar role');
  res.json({ comments });
}

// POST /api/posts/:id/comments
export async function addComment(req, res) {
  const { body } = commentSchema.parse(req.body);
  const post = await Post.exists({ _id: req.params.id, status: 'published' });
  if (!post) throw new HttpError(404, 'Post not found');
  const comment = await Comment.create({ post: req.params.id, author: req.user._id, body });
  await comment.populate('author', 'name avatar role');
  res.status(201).json(comment);
}

// DELETE /api/comments/:id (comment author or admin)
export async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new HttpError(404, 'Comment not found');
  const isOwner = comment.author.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new HttpError(403, 'You can only delete your own comments');
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
}
