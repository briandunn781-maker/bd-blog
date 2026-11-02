import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <title>Not found · BD Blog</title>
      <p className="font-display text-7xl font-bold text-gold-ink">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The page you’re looking for doesn’t exist or was moved.</p>
      <Link to="/" className="mt-6 inline-block rounded-md bg-gold px-4 py-2 text-sm font-semibold text-on-gold hover:bg-gold-hover">
        Back to home
      </Link>
    </div>
  );
}
