import { Link } from 'react-router';
import { site } from '../config/site.js';
import SocialLinks from '../components/SocialLinks.jsx';
import ResumeTabs from '../components/ResumeTabs.jsx';

function Avatar() {
  if (site.photo) {
    return <img src={site.photo} alt={site.name} className="size-40 rounded-full border-2 border-gold object-cover" />;
  }
  const initials = site.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex size-40 items-center justify-center rounded-full border-2 border-gold bg-gold-soft font-display text-5xl font-bold text-gold-ink">
      {initials}
    </div>
  );
}

export default function About() {
  return (
    <div className="mx-auto max-w-3xl">
      <title>{`About · BD Blog`}</title>
      <meta name="description" content={site.bio[0]} />

      <section className="flex flex-col items-center gap-8 border-b border-line pb-12 text-center sm:flex-row sm:items-start sm:text-left">
        <Avatar />
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-gold-ink uppercase">About me</p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">{site.name}</h1>
          <p className="mt-2 text-muted">
            {site.role}
            {site.location && ` · ${site.location}`}
          </p>
          <div className="mt-5 flex justify-center sm:justify-start">
            <SocialLinks />
          </div>
        </div>
      </section>

      <section className="mt-12 space-y-5 text-lg leading-relaxed">
        {site.bio.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold">Experience &amp; background</h2>
        <div className="mt-2 mb-6 h-px w-12 bg-gold" />
        <ResumeTabs />
      </section>

      <section className="mt-12 flex flex-wrap gap-3">
        <Link to="/" className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-on-gold hover:bg-gold-hover">
          Read the blog
        </Link>
        <Link to="/contact" className="rounded-md border border-line-strong px-5 py-2.5 text-sm font-medium hover:border-gold hover:text-gold-ink">
          Get in touch
        </Link>
      </section>
    </div>
  );
}
