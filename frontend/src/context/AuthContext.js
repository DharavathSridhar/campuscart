import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const { data } = await API.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success('Registration successful!');
    return data;
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    toast.success('Login successful!');
    return data;
  };

  const logout = async () => {
    try { await API.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (formData) => {
    const { data } = await API.put('/auth/profile', formData);
    setUser(data.user);
    toast.success('Profile updated!');
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
