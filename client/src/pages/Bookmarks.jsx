import useApi from '../hooks/useApi.js';
import PostCard from '../components/PostCard.jsx';
import { Spinner, ErrorBox, Empty } from '../components/Status.jsx';

export default function Bookmarks() {
  const { data, loading, error } = useApi('/users/bookmarks');

  return (
    <>
      <title>Bookmarks · BD Blog</title>
      <h1 className="mb-8 font-display text-4xl font-bold">Your bookmarks</h1>
      {loading && <Spinner />}
      {error && <ErrorBox>{error}</ErrorBox>}
      {data && !data.posts.length && <Empty>You haven’t saved any posts yet.</Empty>}
      {data?.posts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
