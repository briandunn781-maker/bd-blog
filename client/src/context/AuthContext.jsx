import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  // Optimistically flips the bookmark, rolling back if the request fails
  async function toggleBookmark(postId) {
    const had = user.bookmarks.includes(postId);
    const apply = (add) =>
      setUser((u) => ({
        ...u,
        bookmarks: add ? [...u.bookmarks, postId] : u.bookmarks.filter((id) => id !== postId),
      }));
    apply(!had);
    try {
      await api.post(`/users/bookmarks/${postId}`);
    } catch (err) {
      apply(had);
      throw err;
    }
  }

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    toggleBookmark,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  return useContext(AuthContext);
}
