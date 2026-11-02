import { lazy } from 'react';
import { Routes, Route } from 'react-router';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import PostPage from './pages/PostPage.jsx';
import TagPage from './pages/TagPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Bookmarks from './pages/Bookmarks.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// Admin pages (and the TipTap editor) load on demand so readers never download them
const Dashboard = lazy(() => import('./pages/admin/Dashboard.jsx'));
const EditPost = lazy(() => import('./pages/admin/EditPost.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts/:slug" element={<PostPage />} />
        <Route path="tags/:tag" element={<TagPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute adminOnly>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/new"
          element={
            <ProtectedRoute adminOnly>
              <EditPost key="new" />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/edit/:id"
          element={
            <ProtectedRoute adminOnly>
              <EditPost key="edit" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
