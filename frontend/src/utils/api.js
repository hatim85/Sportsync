import axios from 'axios';

/** Axios instance with auth cookies for protected API routes */
export const api = axios.create({
  baseURL: import.meta.env.VITE_PORT,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${import.meta.env.VITE_PORT}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res;
}
