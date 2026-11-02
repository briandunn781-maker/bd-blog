// Shared card + field styles for the sign-in and sign-up pages
export function AuthCard({ title, children, footer }) {
  return (
    <div className="mx-auto mt-8 max-w-sm">
      <title>{`${title} · BD Blog`}</title>
      <h1 className="mb-6 text-center font-display text-3xl font-bold">{title}</h1>
      <div className="rounded-xl border border-line border-t-2 border-t-gold bg-surface p-6">{children}</div>
      <p className="mt-4 text-center text-sm text-muted">{footer}</p>
    </div>
  );
}

export function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-line-strong bg-page px-3 py-2 text-sm focus:border-gold focus:outline-none"
      />
    </label>
  );
}

export function SubmitButton({ busy, children }) {
  return (
    <button disabled={busy} className="w-full rounded-md bg-gold py-2 text-sm font-semibold text-on-gold hover:bg-gold-hover disabled:opacity-50">
      {busy ? 'Please wait…' : children}
    </button>
  );
}
