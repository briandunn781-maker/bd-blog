import { Link } from 'react-router';

export default function TagChip({ tag, count }) {
  return (
    <Link
      to={`/tags/${encodeURIComponent(tag)}`}
      className="inline-flex items-center gap-1 rounded-full border border-gold/30 bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-gold-ink transition hover:bg-gold hover:text-on-gold"
    >
      #{tag}
      {count != null && <span className="opacity-70">{count}</span>}
    </Link>
  );
}
