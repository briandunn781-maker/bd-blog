// API tests: run with `npm test` (in server/). Uses a throwaway in-memory MongoDB, so no .env is needed.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo, app, User, Post;
let admin, reader, anon;
let post, draft, comment;

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri('bd-blog-test');
  process.env.JWT_SECRET = 'test-secret';
  process.env.CONTACT_EMAIL = 'contact@example.com';

  // Imported after the env is set, since modules read it at load time
  ({ default: app } = await import('../src/app.js'));
  ({ default: User } = await import('../src/models/User.js'));
  ({ default: Post } = await import('../src/models/Post.js'));

  await mongoose.connect(process.env.MONGO_URI);
  await Post.syncIndexes();
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'adminpass1', role: 'admin' });

  // Agents keep cookies between requests, like a browser
  admin = request.agent(app);
  reader = request.agent(app);
  anon = request(app);
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test('admin sign-in', async () => {
  let res = await admin.post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrong' });
  assert.equal(res.status, 401);

  res = await admin.post('/api/auth/login').send({ email: 'ADMIN@test.com', password: 'adminpass1' });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.role, 'admin');
  assert.equal(res.body.user.password, undefined, 'password hash must never be sent');
  assert.match(res.headers['set-cookie'][0], /HttpOnly/);
});

test('creating posts: sanitizing, slugs, derived fields, validation', async () => {
  let res = await admin.post('/api/posts').send({
    title: 'Hello MERN World!',
    content: '<p>Learning <strong>MongoDB</strong> and React.</p><script>alert(1)</script><img src="x" onerror="alert(1)">',
    tags: ['React', 'mongodb'],
    status: 'published',
  });
  assert.equal(res.status, 201);
  post = res.body;
  assert.equal(post.slug, 'hello-mern-world');
  assert.ok(!post.content.includes('<script'), 'script tags are stripped');
  assert.ok(!post.content.includes('onerror'), 'event handlers are stripped');
  assert.deepEqual(post.tags, ['react', 'mongodb']);
  assert.equal(post.readTime, 1);
  assert.ok(post.excerpt);
  assert.ok(post.publishedAt);

  res = await admin.post('/api/posts').send({ title: 'Hello MERN World', content: '<p>Secret draft about mongodb</p>' });
  assert.equal(res.status, 201);
  draft = res.body;
  assert.notEqual(draft.slug, post.slug, 'duplicate titles get unique slugs');
  assert.equal(draft.status, 'draft');

  res = await admin.post('/api/posts').send({ title: '', content: '' });
  assert.equal(res.status, 400);
});

test('public reads: drafts hidden, search, tags', async () => {
  let res = await anon.get('/api/posts');
  assert.equal(res.body.total, 1);
  assert.equal(res.body.posts[0].content, undefined, 'list omits full content');

  res = await anon.get(`/api/posts/${draft.slug}`);
  assert.equal(res.status, 404, 'drafts are hidden from the public');
  res = await admin.get(`/api/posts/${draft.slug}`);
  assert.equal(res.status, 200, 'admin can preview drafts');

  res = await anon.get('/api/posts?q=mongodb');
  assert.equal(res.body.total, 1);
  assert.equal(res.body.posts[0]._id, post._id);

  res = await anon.get('/api/posts?tag=react');
  assert.equal(res.body.total, 1);

  res = await anon.get('/api/tags');
  assert.equal(res.body.tags.length, 2);
});

test('reader accounts and permissions', async () => {
  let res = await reader.post('/api/auth/register').send({ name: 'Reader', email: 'reader@test.com', password: 'readerpass', role: 'admin' });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, 'reader', 'sign-up can never create an admin');

  res = await reader.post('/api/auth/register').send({ name: 'Dup', email: 'reader@test.com', password: 'readerpass' });
  assert.equal(res.status, 409);

  res = await reader.get('/api/auth/me');
  assert.equal(res.body.user.email, 'reader@test.com');
  res = await anon.get('/api/auth/me');
  assert.equal(res.status, 200);
  assert.equal(res.body.user, null);

  assert.equal((await reader.post('/api/posts').send({ title: 'x', content: '<p>x</p>' })).status, 403);
  assert.equal((await reader.get('/api/posts/admin/all')).status, 403);
  assert.equal((await anon.get('/api/posts/admin/all')).status, 401);
  assert.equal((await anon.post(`/api/posts/${post._id}/like`)).status, 401);
});

test('likes, bookmarks and comments', async () => {
  let res = await reader.post(`/api/posts/${post._id}/like`);
  assert.deepEqual(res.body, { liked: true, likesCount: 1 });
  res = await reader.post(`/api/posts/${post._id}/like`);
  assert.deepEqual(res.body, { liked: false, likesCount: 0 });
  assert.equal((await reader.post(`/api/posts/${draft._id}/like`)).status, 404, 'cannot like a draft');

  res = await reader.post(`/api/users/bookmarks/${post._id}`);
  assert.equal(res.body.bookmarked, true);
  res = await reader.get('/api/users/bookmarks');
  assert.equal(res.body.posts.length, 1);

  res = await reader.post(`/api/posts/${post._id}/comments`).send({ body: '  Great post!  ' });
  assert.equal(res.status, 201);
  comment = res.body;
  assert.equal(comment.body, 'Great post!');
  assert.equal(comment.author.name, 'Reader');

  res = await anon.get(`/api/posts/${post._id}/comments`);
  assert.equal(res.body.comments.length, 1);
  assert.equal((await anon.delete(`/api/comments/${comment._id}`)).status, 401);
  assert.equal((await admin.delete(`/api/comments/${comment._id}`)).status, 200, 'admin can delete any comment');
});

test('updating and deleting posts', async () => {
  let res = await admin.put(`/api/posts/${post._id}`).send({ ...post, title: 'Renamed title', coverImage: null });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Renamed title');
  assert.equal(res.body.slug, 'hello-mern-world', 'published slugs never change');

  assert.equal((await admin.delete(`/api/posts/${post._id}`)).status, 200);
  res = await reader.get('/api/auth/me');
  assert.equal(res.body.user.bookmarks.length, 0, 'deleted posts are removed from bookmarks');

  assert.equal((await admin.get('/api/posts/admin/not-an-id')).status, 404);
});

test('sign-out clears the session', async () => {
  await reader.post('/api/auth/logout');
  const res = await reader.get('/api/auth/me');
  assert.equal(res.body.user, null);
});

test('contact email is revealed only after a passed bot check', async () => {
  // Stand in for Cloudflare's verification service so the test needs no network
  const realFetch = globalThis.fetch;
  let verifyResult = true;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /challenges\.cloudflare\.com/);
    return { json: async () => ({ success: verifyResult }) };
  };
  try {
    assert.equal((await anon.post('/api/contact/reveal-email').send({})).status, 400);

    let res = await anon.post('/api/contact/reveal-email').send({ token: 'good-token' });
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'contact@example.com');
    assert.equal(res.headers['cache-control'], 'no-store');

    verifyResult = false;
    res = await anon.post('/api/contact/reveal-email').send({ token: 'bad-token' });
    assert.equal(res.status, 403);
    assert.equal(res.body.email, undefined);

    // 3 requests used so far; the limit is 10 per window
    for (let i = 0; i < 7; i++) await anon.post('/api/contact/reveal-email').send({ token: 'x' });
    assert.equal((await anon.post('/api/contact/reveal-email').send({ token: 'x' })).status, 429);
  } finally {
    globalThis.fetch = realFetch;
  }
});
