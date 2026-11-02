import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import api, { errorMessage } from '../api/client.js';

export default function PostActions({ post }) {
  const { user, toggleBookmark } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [likeIds, setLikeIds] = useState(post.likes);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const liked = Boolean(user && likeIds.includes(user._id));
  const bookmarked = Boolean(user?.bookmarks.includes(post._id));
  const requireUser = () => {
    if (user) return true;
    navigate('/login', { state: { from: location.pathname } });
    return false;
  };

  async function onLike() {
    if (!requireUser()) return;
    const previous = likeIds;
    setLikeIds(liked ? previous.filter((id) => id !== user._id) : [...previous, user._id]);
    try {
      await api.post(`/posts/${post._id}/like`);
    } catch (err) {
      setLikeIds(previous);
      setError(errorMessage(err));
    }
  }

  async function onBookmark() {
    if (!requireUser()) return;
    try {
      await toggleBookmark(post._id);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function onShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy the link');
    }
  }

  const btn = 'inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition';
  const idle = 'border-line-strong text-ink hover:border-gold hover:text-gold-ink';
  const active = 'border-gold bg-gold-soft text-gold-ink';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={onLike} aria-pressed={liked} className={`${btn} ${liked ? active : idle}`}>
        {liked ? '♥' : '♡'} {likeIds.length}
      </button>
      <button onClick={onBookmark} aria-pressed={bookmarked} className={`${btn} ${bookmarked ? active : idle}`}>
        {bookmarked ? '★ Saved' : '☆ Save'}
      </button>
      <button onClick={onShare} className={`${btn} ${idle}`}>
        {copied ? 'Link copied' : 'Share'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
