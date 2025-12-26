const RAW_API_URL = (window as any).__API_URL__ || '';
export const API_BASE_URL = RAW_API_URL.replace(/\/+$/, '');
