import mongoose from 'mongoose';
import { readTime, makeExcerpt } from '../utils/text.js';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: {
      url: String,
      publicId: String,
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    readTime: { type: Number, default: 1 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

postSchema.index(
  { title: 'text', excerpt: 'text', content: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, excerpt: 3, content: 1 } },
);
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ tags: 1 });

postSchema.pre('validate', function () {
  if (this.isModified('content')) {
    this.readTime = readTime(this.content);
    if (!this.excerpt) this.excerpt = makeExcerpt(this.content);
  }
  if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
});

export default mongoose.model('Post', postSchema);
