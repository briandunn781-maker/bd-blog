import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const isProd = process.env.NODE_ENV === 'production';
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');

const app = express();

// Render, Railway etc. sit behind a proxy; needed for secure cookies and rate limiting
if (isProd) app.set('trust proxy', 1);

// The CSP lists the only outside hosts the site may load from
const TURNSTILE = 'https://challenges.cloudflare.com';
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", TURNSTILE],
        frameSrc: [TURNSTILE],
        connectSrc: ["'self'", TURNSTILE],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  }),
);
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/contact', contactRoutes);

// In production this server also hosts the built React app, so site and API share one origin
if (isProd) {
  app.use(
    express.static(clientDist, {
      setHeaders: (res, filePath) => {
        // Vite fingerprints files in /assets, so they can be cached forever
        if (filePath.includes(`${path.sep}assets${path.sep}`)) res.set('Cache-Control', 'public, max-age=31536000, immutable');
        // index.html must always be re-checked so visitors get the newest deploy
        else if (filePath.endsWith('index.html')) res.set('Cache-Control', 'no-cache');
      },
    }),
  );
  // Any other page URL (e.g. /posts/my-post) gets index.html and React Router takes over
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    res.set('Cache-Control', 'no-cache').sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
