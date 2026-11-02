# BD Blog

A full-stack personal blog built with the MERN stack: **MongoDB, Express, React, Node**.

- One admin writes posts in a rich-text editor (TipTap), with drafts, cover images and inline images (Cloudinary)
- Readers can sign up to comment, like and bookmark posts
- Tags, full-text search, pagination and dark mode

## Tech

| Layer    | Stack                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------- |
| Client   | React 19, React Router, Vite, Tailwind CSS 4 + Typography, TipTap 3, Axios                        |
| Server   | Express 5, Mongoose, JWT in an httpOnly cookie, bcrypt, zod, sanitize-html, helmet, rate limiting |
| Services | MongoDB Atlas, Cloudinary                                                                         |

## Getting started

**Prerequisites:** Node 20+, a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and a free [Cloudinary](https://cloudinary.com) account.

```bash
npm run install:all                       # installs root, server and client deps
cp server/.env.example server/.env        # then fill in the values
npm run seed:admin                        # creates your admin account from ADMIN_* in .env
npm run dev                               # API on :5000, client on http://localhost:5173
```

Sign in with your admin email and password, then open **Dashboard → New post**.

## Project structure

```
server/
  server.js               entry point
  scripts/seedAdmin.js    creates or resets the admin user
  src/
    app.js                express app + route mounting
    config/               db connection, cloudinary
    models/               User, Post, Comment
    controllers/          request handlers
    routes/               URL -> middleware -> controller
    middleware/           auth (protect/adminOnly), errors, uploads
    utils/                slugs, read time, HTML sanitizing
client/
  src/
    api/                  axios instance + upload helper
    context/AuthContext   current user, login/logout, bookmarks
    hooks/useApi          tiny data-fetching hook
    components/           Navbar, PostCard, Editor, CommentSection, ...
    pages/                Home, Post, Tag, Search, Login, Register, Bookmarks, admin/*
```

## API overview

| Method              | Path                                                   | Access                                       |
| ------------------- | ------------------------------------------------------ | -------------------------------------------- |
| POST                | `/api/auth/register` · `/login` · `/logout`            | public                                       |
| GET                 | `/api/auth/me`                                         | public (returns `null` user when signed out) |
| GET                 | `/api/posts?page&limit&tag&q`                          | public                                       |
| GET                 | `/api/posts/:slug`                                     | public (admin can preview drafts)            |
| POST / PUT / DELETE | `/api/posts`, `/api/posts/:id`                         | admin                                        |
| GET                 | `/api/posts/admin/all`, `/api/posts/admin/:id`         | admin                                        |
| POST                | `/api/posts/:id/like`                                  | signed in                                    |
| GET / POST          | `/api/posts/:id/comments`                              | public / signed in                           |
| DELETE              | `/api/comments/:id`                                    | comment author or admin                      |
| GET / POST          | `/api/users/bookmarks`, `/api/users/bookmarks/:postId` | signed in                                    |
| GET                 | `/api/tags`                                            | public                                       |
| POST                | `/api/uploads` (multipart `image`)                     | admin                                        |

## Testing

```bash
npm test        # API tests against a throwaway in-memory MongoDB (no .env needed)
```

## Deployment (CI/CD)

The site runs as **one Render web service**. In production, Express serves both the API (`/api/...`) and the built React app, so the site and API share one URL and the auth cookie works in every browser.

Every push to `main`:
1. **CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)): GitHub Actions installs dependencies, runs the API tests and builds the client.
2. **CD** ([render.yaml](render.yaml)): when CI passes, Render rebuilds and redeploys automatically. A failed check means the previous version keeps running.

### One-time setup

1. **MongoDB Atlas → Network Access:** allow `0.0.0.0/0` (Render's free tier has no fixed IP; the database password still protects it).
2. **Cloudflare Turnstile:** create a free widget for your site's hostname (e.g. `bd-blog.onrender.com`) and copy the site key and secret key.
3. **Render:** sign in with GitHub → **New → Blueprint** → choose this repo. Fill in the secret values it asks for (`MONGO_URI`, a new `JWT_SECRET`, Cloudinary keys, `CONTACT_EMAIL`, `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY`), then deploy.
4. **Admin account:** run `npm run seed:admin` locally with `server/.env` pointing at the same Atlas database.

On the free plan the service sleeps after about 15 idle minutes, and the next visit takes 30–60 seconds to wake it. Upgrading the instance type in Render removes this with no code changes.
