const BASE_URL = '/api/admin';

const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_profile');
    // If we're not already on the login page, redirect
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Unauthorized');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  return data;
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  post: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  patch: async (endpoint, body) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },


  delete: async (endpoint) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data && data.success && data.data) {
      localStorage.setItem('admin_token', data.data.token);
      localStorage.setItem('admin_profile', JSON.stringify(data.data.admin));
      return data.data;
    }
    throw new Error(data.message || 'Login failed');
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_profile');
    window.location.href = '/admin/login';
  },

  getProfile: () => {
    try {
      const profile = localStorage.getItem('admin_profile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
  }
};
