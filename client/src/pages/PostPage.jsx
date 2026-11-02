import { Link, useParams } from 'react-router';
import useApi from '../hooks/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostActions from '../components/PostActions.jsx';
import CommentSection from '../components/CommentSection.jsx';
import TagChip from '../components/TagChip.jsx';
import { Spinner, ErrorBox } from '../components/Status.jsx';
import NotFound from './NotFound.jsx';
import { formatDate } from '../utils/format.js';

export default function PostPage() {
  const { slug } = useParams();
  const { isAdmin } = useAuth();
  const { data: post, loading, error } = useApi(`/posts/${slug}`);

  if (loading) return <Spinner />;
  if (error === 'Post not found') return <NotFound />;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <article className="mx-auto max-w-3xl">
      <title>{`${post.title} · BD Blog`}</title>
      <meta name="description" content={post.excerpt} />

      {post.status === 'draft' && (
        <p className="mb-6 rounded-lg border border-gold/40 bg-gold-soft px-4 py-2 text-sm text-gold-ink">
          Draft preview: only you can see this post.
        </p>
      )}

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">{post.title}</h1>
        <div className="mt-5 h-px w-16 bg-gold" />
        <p className="mt-4 text-sm text-muted">
          <span className="font-medium text-ink">{post.author?.name}</span> · {formatDate(post.publishedAt || post.createdAt)} · {post.readTime} min read
          {isAdmin && (
            <Link to={`/admin/edit/${post._id}`} className="ml-3 font-medium text-gold-ink hover:underline">
              Edit
            </Link>
          )}
        </p>
      </header>

      {post.coverImage?.url && <img src={post.coverImage.url} alt="" className="mb-10 w-full rounded-xl object-cover" />}

      {/* Content is sanitized on the server before it is saved */}
      <div
        className="prose prose-lg max-w-none prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.status === 'published' && (
        <>
          <div className="mt-10">
            <PostActions post={post} />
          </div>
          <CommentSection postId={post._id} />
        </>
      )}
    </article>
  );
}
