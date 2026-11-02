import sanitizeHtml from 'sanitize-html';

// Whitelist of what the TipTap editor can produce; anything else is stripped
const options = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr', 'blockquote',
    'strong', 'b', 'em', 'i', 'u', 's', 'code', 'pre', 'mark',
    'ul', 'ol', 'li', 'a', 'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    code: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }),
  },
};

export default function cleanHtml(dirty) {
  return sanitizeHtml(dirty, options);
}
