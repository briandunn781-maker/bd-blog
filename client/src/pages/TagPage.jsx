import { useParams } from 'react-router';
import PostFeed from '../components/PostFeed.jsx';

export default function TagPage() {
  const { tag } = useParams();

  return (
    <>
      <title>{`#${tag} · BD Blog`}</title>
      <h1 className="mb-8 font-display text-4xl font-bold">
        Posts tagged <span className="text-gold-ink">#{tag}</span>
      </h1>
      <PostFeed tag={tag} emptyText="No posts with this tag yet." />
    </>
  );
}
