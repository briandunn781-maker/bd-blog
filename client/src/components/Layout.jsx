import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import Navbar from './Navbar.jsx';
import { Spinner } from './Status.jsx';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        <nav className="mb-2 space-x-4">
          <Link to="/" className="hover:text-gold-ink">Home</Link>
          <Link to="/about" className="hover:text-gold-ink">About</Link>
          <Link to="/contact" className="hover:text-gold-ink">Contact</Link>
        </nav>
        © {new Date().getFullYear()} BD<span className="text-gold-ink">Blog</span>
      </footer>
    </div>
  );
}
