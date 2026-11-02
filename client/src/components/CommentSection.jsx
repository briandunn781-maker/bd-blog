import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import useApi from '../hooks/useApi.js';
import api, { errorMessage } from '../api/client.js';
import { Spinner, ErrorBox } from './Status.jsx';
import { formatDate } from '../utils/format.js';

export default function CommentSection({ postId }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const { data, loading, error, setData } = useApi(`/posts/${postId}/comments`);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const { data: comment } = await api.post(`/posts/${postId}/comments`, { body });
      setData((d) => ({ comments: [...d.comments, comment] }));
      setBody('');
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${id}`);
      setData((d) => ({ comments: d.comments.filter((c) => c._id !== id) }));
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  const comments = data?.comments ?? [];

  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="mb-6 font-display text-2xl font-bold">Comments {data && <span className="text-gold-ink">({comments.length})</span>}</h2>

      {user ? (
        <form onSubmit={onSubmit} className="mb-8 space-y-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            required
            placeholder="Share your thoughts…"
            aria-label="Write a comment"
            className="w-full rounded-lg border border-line-strong bg-transparent p-3 text-sm placeholder:text-muted focus:border-gold focus:outline-none"
          />
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button disabled={submitting || !body.trim()} className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-on-gold hover:bg-gold-hover disabled:opacity-50">
            {submitting ? 'Posting…' : 'Post comment'}
          </button>
        </form>
      ) : (
        <p className="mb-8 text-sm text-muted">
          <Link to="/login" state={{ from: location.pathname }} className="font-medium text-gold-ink hover:underline">
            Sign in
          </Link>{' '}
          to join the conversation.
        </p>
      )}

      {loading && <Spinner label="Loading comments…" />}
      {error && <ErrorBox>{error}</ErrorBox>}
      {data && comments.length === 0 && <p className="text-sm text-muted">No comments yet. Be the first!</p>}

      <ul className="space-y-6">
        {comments.map((c) => (
          <li key={c._id} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold-soft text-sm font-semibold text-gold-ink">
              {c.author?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="font-medium">{c.author?.name ?? 'Deleted user'}</span>
                {c.author?.role === 'admin' && (
                  <span className="ml-1.5 rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-on-gold uppercase">Author</span>
                )}
                <span className="ml-2 text-muted">{formatDate(c.createdAt)}</span>
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{c.body}</p>
              {(isAdmin || c.author?._id === user?._id) && (
                <button onClick={() => onDelete(c._id)} className="mt-1 text-xs text-muted hover:text-red-600">
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
