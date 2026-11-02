import Post from '../models/Post.js';
import User from '../models/User.js';
import HttpError from '../utils/httpError.js';

// POST /api/users/bookmarks/:postId (toggle)
export async function toggleBookmark(req, res) {
  const { postId } = req.params;
  const exists = await Post.exists({ _id: postId, status: 'published' });
  if (!exists) throw new HttpError(404, 'Post not found');
  const has = req.user.bookmarks.some((id) => id.equals(postId));
  const update = has ? { $pull: { bookmarks: postId } } : { $addToSet: { bookmarks: postId } };
  await User.updateOne({ _id: req.user._id }, update);
  res.json({ bookmarked: !has });
}

// GET /api/users/bookmarks
export async function listBookmarks(req, res) {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarks',
    match: { status: 'published' },
    select: '-content',
    populate: { path: 'author', select: 'name avatar' },
  });
  res.json({ posts: user.bookmarks });
}
