// ============================================
// CONFIG — Change API_BASE to your backend URL
// ============================================
const CONFIG = {
  API_BASE: 'http://localhost:5000/api',
  TOKEN_KEY: 'taskmaster_token',
  USER_KEY: 'taskmaster_user'
};

// API Helper
const api = {
  getHeaders() {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  },

  async request(method, path, body = null) {
    const options = {
      method,
      headers: this.getHeaders()
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${CONFIG.API_BASE}${path}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    return data;
  },

  get: (path) => api.request('GET', path),
  post: (path, body) => api.request('POST', path, body),
  put: (path, body) => api.request('PUT', path, body),
  patch: (path, body) => api.request('PATCH', path, body),
  delete: (path) => api.request('DELETE', path)
};
