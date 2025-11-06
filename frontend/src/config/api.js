const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://event-management-systems-alpha.vercel.app'  // ← Use this URL
  : 'http://localhost:8000';

export default API_BASE_URL;
