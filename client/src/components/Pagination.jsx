import { useSearchParams } from 'react-router';

export default function Pagination({ page, pages }) {
  const [params, setParams] = useSearchParams();
  if (pages <= 1) return null;

  function go(p) {
    const next = new URLSearchParams(params);
    next.set('page', p);
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const btn =
    'rounded-md border border-line-strong px-3 py-1.5 text-sm enabled:hover:border-gold enabled:hover:text-gold-ink disabled:opacity-40';
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-3">
      <button className={btn} disabled={page <= 1} onClick={() => go(page - 1)}>
        ← Newer
      </button>
      <span className="text-sm text-muted">
        Page {page} of {pages}
      </span>
      <button className={btn} disabled={page >= pages} onClick={() => go(page + 1)}>
        Older →
      </button>
    </nav>
  );
}
