import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import useApi from '../../hooks/useApi.js';
import api, { uploadImage, errorMessage } from '../../api/client.js';
import Editor from '../../components/Editor.jsx';
import { Spinner, ErrorBox } from '../../components/Status.jsx';

const inputClass =
  'w-full rounded-md border border-line-strong bg-transparent px-3 py-2 placeholder:text-muted focus:border-gold focus:outline-none';

export default function EditPost() {
  const { id } = useParams();
  const { data, loading, error } = useApi(id ? `/posts/admin/${id}` : null);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox>{error}</ErrorBox>;
  // Mount the form only once the post is loaded so it can seed its own state
  return <PostForm post={data} />;
}

function PostForm({ post }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(post?.title ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [tags, setTags] = useState(post?.tags?.join(', ') ?? '');
  const [coverImage, setCoverImage] = useState(post?.coverImage?.url ? post.coverImage : null);
  const [content, setContent] = useState(post?.content ?? '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(post?.status ?? 'draft');

  const isPublished = currentStatus === 'published';

  async function onCoverSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('cover');
    setError('');
    try {
      setCoverImage(await uploadImage(file));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy('');
    }
  }

  async function save(status) {
    setBusy(status);
    setError('');
    setSaved(false);
    const payload = {
      title,
      excerpt,
      content,
      coverImage,
      status,
      tags: [...new Set(tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))],
    };
    try {
      const { data } = post ? await api.put(`/posts/${post._id}`, payload) : await api.post('/posts', payload);
      if (status === 'published') navigate(`/posts/${data.slug}`);
      else if (!post) navigate(`/admin/edit/${data._id}`, { replace: true });
      else {
        setCurrentStatus(data.status);
        setSaved(true);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy('');
    }
  }

  const emptyContent = !content || content === '<p></p>';

  return (
    <div className="mx-auto max-w-3xl">
      <title>{post ? 'Edit post · BD Blog' : 'New post · BD Blog'}</title>
      <div className="mb-6 flex items-center justify-between">
        <Link to="/admin" className="text-sm text-muted hover:text-gold-ink">
          ← Dashboard
        </Link>
        {post && (
          <span className="text-sm text-muted">
            {isPublished ? 'Published' : 'Draft'}
            {saved && ' · Saved'}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {error && <ErrorBox>{error}</ErrorBox>}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          aria-label="Title"
          maxLength={200}
          className="w-full bg-transparent font-display text-3xl font-bold placeholder:text-muted focus:outline-none sm:text-5xl"
        />

        <div>
          <span className="mb-2 block text-sm font-medium">Cover image</span>
          {coverImage ? (
            <div className="relative">
              <img src={coverImage.url} alt="Cover preview" className="aspect-video w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage(null)}
                className="absolute top-2 right-2 rounded-md bg-black/60 px-3 py-1 text-sm text-white hover:bg-black/80"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="flex aspect-[3/1] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line-strong text-sm text-muted hover:border-gold hover:text-gold-ink">
              {busy === 'cover' ? 'Uploading…' : 'Click to upload a cover image'}
              <input type="file" accept="image/*" hidden onChange={onCoverSelected} disabled={busy === 'cover'} />
            </label>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Tags</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, mongodb, career" className={inputClass} />
          <span className="mt-1 block text-xs text-muted">Comma separated, up to 10.</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Excerpt</span>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Optional. Leave empty to use the start of the post."
            className={inputClass}
          />
        </label>

        <Editor content={content} onChange={setContent} />

        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => save('draft')}
            disabled={Boolean(busy) || !title.trim() || emptyContent}
            className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium enabled:hover:border-gold enabled:hover:text-gold-ink disabled:opacity-50"
          >
            {busy === 'draft' ? 'Saving…' : isPublished ? 'Unpublish' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => save('published')}
            disabled={Boolean(busy) || !title.trim() || emptyContent}
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-on-gold enabled:hover:bg-gold-hover disabled:opacity-50"
          >
            {busy === 'published' ? 'Publishing…' : isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
