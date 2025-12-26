const RAW_API_URL = (window as any).__API_URL__ || 'http://localhost:3000';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');
