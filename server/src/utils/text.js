const WORDS_PER_MINUTE = 200;

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function readTime(html) {
  const words = stripHtml(html).split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function makeExcerpt(html, length = 200) {
  const text = stripHtml(html);
  if (text.length <= length) return text;
  return `${text.slice(0, text.lastIndexOf(' ', length))}…`;
}
