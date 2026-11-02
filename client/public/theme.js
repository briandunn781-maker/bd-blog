// Apply the theme before first paint to avoid a flash. Black & gold (dark) is the default.
// Kept as a file (not an inline script) so the Content-Security-Policy can forbid inline scripts.
try {
  if (localStorage.getItem('theme') !== 'light') document.documentElement.classList.add('dark');
} catch {
  document.documentElement.classList.add('dark');
}
