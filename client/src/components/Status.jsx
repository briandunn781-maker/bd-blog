export function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-gold" />
      {label}
    </div>
  );
}

export function ErrorBox({ children }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
      {children}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="py-16 text-center text-muted">{children}</p>;
}
