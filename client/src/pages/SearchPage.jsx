import { useSearchParams } from 'react-router';
import PostFeed from '../components/PostFeed.jsx';
import { Empty } from '../components/Status.jsx';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q')?.trim() ?? '';

  return (
    <>
      <title>{q ? `Search: ${q} · BD Blog` : 'Search · BD Blog'}</title>
      <h1 className="mb-8 font-display text-4xl font-bold">
        {q ? (
          <>
            Results for <span className="text-gold-ink">“{q}”</span>
          </>
        ) : (
          'Search'
        )}
      </h1>
      {q ? <PostFeed q={q} emptyText="No posts matched your search." /> : <Empty>Type something in the search box above.</Empty>}
    </>
  );
}
