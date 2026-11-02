import { useState } from 'react';
import { Link } from 'react-router';
import useApi from '../../hooks/useApi.js';
import api, { errorMessage } from '../../api/client.js';
import { Spinner, ErrorBox, Empty } from '../../components/Status.jsx';
import { formatDate } from '../../utils/format.js';

export default function Dashboard() {
  const { data, loading, error, setData } = useApi('/posts/admin/all');
  const [actionError, setActionError] = useState('');

  async function onDelete(post) {
    if (!window.confirm(`Delete “${post.title}”? This also removes its comments and cannot be undone.`)) return;
    try {
      await api.delete(`/posts/${post._id}`);
      setData((d) => ({ posts: d.posts.filter((p) => p._id !== post._id) }));
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  const posts = data?.posts ?? [];
  const published = posts.filter((p) => p.status === 'published');

  return (
    <>
      <title>Dashboard · BD Blog</title>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Dashboard</h1>
          {data && (
            <p className="mt-1 text-sm text-muted">
              {published.length} published · {posts.length - published.length} drafts ·{' '}
              {published.reduce((sum, p) => sum + p.likes.length, 0)} likes
            </p>
          )}
        </div>
        <Link to="/admin/new" className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-on-gold hover:bg-gold-hover">
          + New post
        </Link>
      </div>

      {loading && <Spinner />}
      {(error || actionError) && <ErrorBox>{error || actionError}</ErrorBox>}
      {data && !posts.length && <Empty>No posts yet. Write your first one!</Empty>}

      {posts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gold/40 bg-surface text-xs tracking-wider text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((post) => (
                <tr key={post._id}>
                  <td className="max-w-xs truncate px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        post.status === 'published' ? 'border-gold/40 bg-gold-soft text-gold-ink' : 'border-line-strong text-muted'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">{formatDate(post.updatedAt)}</td>
                  <td className="space-x-3 px-4 py-3 text-right whitespace-nowrap">
                    <Link to={`/posts/${post.slug}`} className="text-muted hover:text-ink hover:underline">
                      View
                    </Link>
                    <Link to={`/admin/edit/${post._id}`} className="font-medium text-gold-ink hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => onDelete(post)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
