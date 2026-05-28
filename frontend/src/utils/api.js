import axios from 'axios';

/** Axios instance with auth cookies + Bearer token for protected API routes */
export const api = axios.create({
  baseURL: import.meta.env.VITE_PORT,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

function getStoredToken() {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') return null;
  return token;
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${import.meta.env.VITE_PORT}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  return res;
}
