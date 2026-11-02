import { Link } from 'react-router';
import TagChip from './TagChip.jsx';
import { formatDate } from '../utils/format.js';

export default function PostCard({ post }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-lg hover:shadow-gold/5">
      {post.coverImage?.url ? (
        <Link to={`/posts/${post.slug}`}>
          <img src={post.coverImage.url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
        </Link>
      ) : (
        <div className="aspect-video bg-linear-to-br from-[#0b0b0b] via-[#1f1a0e] to-[#d4af37]/70" />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <TagChip key={t} tag={t} />
            ))}
          </div>
        )}
        <h2 className="font-display text-xl leading-snug font-bold">
          <Link to={`/posts/${post.slug}`} className="hover:text-gold-ink">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="line-clamp-3 text-sm text-muted">{post.excerpt}</p>}
        <p className="mt-auto text-xs text-muted">
          {formatDate(post.publishedAt)} · {post.readTime} min read · <span className="text-gold-ink">♥</span> {post.likes?.length ?? 0}
        </p>
      </div>
    </article>
  );
}
