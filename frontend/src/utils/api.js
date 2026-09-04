import axios from 'axios';

// CRA exposes only REACT_APP_* variables.  Use the configured backend in
// development and production so HTTP and socket traffic target the same API.
const API_URL = process.env.REACT_APP_API_URL || '/api';

const API = axios.create({ baseURL: API_URL, withCredentials: true });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
