import useApi from "../hooks/useApi.js";
import PostFeed from "../components/PostFeed.jsx";
import TagChip from "../components/TagChip.jsx";

export default function Home() {
  const { data } = useApi("/tags");

  return (
    <>
      <title>BD Blog</title>
      <section className="mb-12 border-b border-line pb-10">
        <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-gold-ink uppercase">
          The BD Blog
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
          What's on your <span className="text-gold-ink italic">mind?</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          A place to share your thoughts, ideas, and stories.
        </p>
        {data?.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {data.tags.map(({ tag, count }) => (
              <TagChip key={tag} tag={tag} count={count} />
            ))}
          </div>
        )}
      </section>
      <PostFeed />
    </>
  );
}
