import { z } from 'zod';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';
import cleanHtml from '../utils/sanitize.js';
import { uniqueSlug } from '../utils/slugify.js';
import { deleteImage } from '../config/cloudinary.js';

const postSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().trim().max(300).default(''),
  coverImage: z.object({ url: z.url(), publicId: z.string().optional() }).nullish(),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(10).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
});

const AUTHOR_FIELDS = 'name avatar';

function pagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 9));
  return { page, limit, skip: (page - 1) * limit };
}

// GET /api/posts?page=&limit=&tag=&q=
export async function listPosts(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filter = { status: 'published' };
  if (req.query.tag) filter.tags = String(req.query.tag).toLowerCase();

  const q = req.query.q ? String(req.query.q).trim() : '';
  if (q) filter.$text = { $search: q };
  const sort = q ? { score: { $meta: 'textScore' }, publishedAt: -1 } : { publishedAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter).select('-content').sort(sort).skip(skip).limit(limit).populate('author', AUTHOR_FIELDS),
    Post.countDocuments(filter),
  ]);
  res.json({ posts, page, pages: Math.max(1, Math.ceil(total / limit)), total });
}

// GET /api/posts/:slug (admin can preview drafts)
export async function getPostBySlug(req, res) {
  const filter = { slug: req.params.slug };
  if (req.user?.role !== 'admin') filter.status = 'published';
  const post = await Post.findOne(filter).populate('author', AUTHOR_FIELDS);
  if (!post) throw new HttpError(404, 'Post not found');
  res.json(post);
}

// GET /api/posts/admin/all
export async function adminListPosts(req, res) {
  const posts = await Post.find().select('-content').sort({ updatedAt: -1 });
  res.json({ posts });
}

// GET /api/posts/admin/:id
export async function adminGetPost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found');
  res.json(post);
}

export async function createPost(req, res) {
  const data = postSchema.parse(req.body);
  const post = await Post.create({
    ...data,
    coverImage: data.coverImage ?? undefined,
    content: cleanHtml(data.content),
    slug: await uniqueSlug(Post, data.title),
    author: req.user._id,
  });
  res.status(201).json(post);
}

export async function updatePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found');
  const data = postSchema.parse(req.body);

  // Keep published URLs stable; only drafts get a new slug when the title changes
  if (post.status === 'draft' && data.title !== post.title) {
    post.slug = await uniqueSlug(Post, data.title, post._id);
  }
  const oldCoverId = post.coverImage?.publicId;
  if (oldCoverId && oldCoverId !== data.coverImage?.publicId) await deleteImage(oldCoverId);

  post.set({ ...data, coverImage: data.coverImage ?? undefined, content: cleanHtml(data.content) });
  await post.save();
  res.json(post);
}

export async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'Post not found');
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    User.updateMany({ bookmarks: post._id }, { $pull: { bookmarks: post._id } }),
    deleteImage(post.coverImage?.publicId),
  ]);
  await post.deleteOne();
  res.json({ message: 'Post deleted' });
}

// POST /api/posts/:id/like (toggle)
export async function toggleLike(req, res) {
  const post = await Post.findOne({ _id: req.params.id, status: 'published' }).select('likes');
  if (!post) throw new HttpError(404, 'Post not found');
  const liked = post.likes.some((id) => id.equals(req.user._id));
  const update = liked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } };
  const updated = await Post.findByIdAndUpdate(post._id, update, { returnDocument: 'after' }).select('likes');
  res.json({ liked: !liked, likesCount: updated.likes.length });
}
