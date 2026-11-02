import { site } from '../config/site.js';

export default function SocialLinks() {
  if (!site.socials.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {site.socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium transition hover:border-gold hover:text-gold-ink"
          >
            {s.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
