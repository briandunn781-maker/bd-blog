import { useSearchParams } from 'react-router';
import useApi from '../hooks/useApi.js';
import PostCard from './PostCard.jsx';
import Pagination from './Pagination.jsx';
import { Spinner, ErrorBox, Empty } from './Status.jsx';

// Paginated grid of published posts, optionally filtered by tag or search query
export default function PostFeed({ tag, q, emptyText = 'No posts yet.' }) {
  const [params] = useSearchParams();
  const query = new URLSearchParams({ page: params.get('page') || '1' });
  if (tag) query.set('tag', tag);
  if (q) query.set('q', q);

  const { data, loading, error } = useApi(`/posts?${query}`);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!data.posts.length) return <Empty>{emptyText}</Empty>;

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      <Pagination page={data.page} pages={data.pages} />
    </>
  );
}
