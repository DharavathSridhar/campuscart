import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'http://13.206.139.171:5000/api' 
  : 'http://localhost:5000/api';

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
