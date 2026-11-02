import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'text-gold-ink' : 'text-muted hover:text-ink'}`;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-page/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-2 font-display text-2xl font-bold tracking-tight">
          BD<span className="text-gold-ink">Blog</span>
        </Link>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>

        <form onSubmit={onSearch} className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            aria-label="Search posts"
            className="w-full rounded-md border border-line-strong bg-transparent px-3 py-1.5 text-sm placeholder:text-muted focus:border-gold focus:outline-none sm:max-w-xs"
          />
        </form>

        <div className="ml-auto flex items-center gap-1">
          {user && (
            <NavLink to="/bookmarks" className={linkClass}>
              Bookmarks
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" end className={linkClass}>
              Dashboard
            </NavLink>
          )}
          {user ? (
            <button onClick={onLogout} className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-ink">
              Sign out
            </button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Sign in
              </NavLink>
              <Link to="/register" className="rounded-md bg-gold px-3 py-1.5 text-sm font-semibold text-on-gold hover:bg-gold-hover">
                Sign up
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
