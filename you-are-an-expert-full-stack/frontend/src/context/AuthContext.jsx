import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

function storedUser() {
  if (!localStorage.getItem('access_token')) return null;
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('access_token')));

  const loadUser = async () => {
    try {
      const { data } = await api.get('/api/users/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) loadUser();
    else setLoading(false);
  }, []);

  const login = async (payload, mode = 'login') => {
    const { data } = await api.post(`/api/auth/${mode}`, payload);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, loading, login, logout, loadUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
