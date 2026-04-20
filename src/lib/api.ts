const isDev = import.meta.env.DEV;

// In production on Vercel, we use relative paths thanks to vercel.json rewrites.
// In development, we connect to the local servers.
export const API_BASE = isDev ? 'http://localhost:3001/api' : '/api';
export const FLASK_API_BASE = isDev ? 'http://127.0.0.1:5001/api/flask' : '/api/flask';
