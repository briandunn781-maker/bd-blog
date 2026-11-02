import Post from '../models/Post.js';

// GET /api/tags -> [{ tag, count }] across published posts
export async function listTags(req, res) {
  const tags = await Post.aggregate([
    { $match: { status: 'published' } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);
  res.json({ tags });
}
