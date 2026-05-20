// 📁 FILE: frontend/src/services/api.js

import axios from 'axios';

// ── Base URL — works for both local and production ─────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const API = axios.create({
  baseURL:         BASE_URL,
  withCredentials: true,
  timeout:         30000,
});

// ── Attach JWT token to every request ─────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ew_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 — redirect to login ────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ew_token');
      localStorage.removeItem('ew_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════
//  AUTH API
// ══════════════════════════════════════════════════════════════
export const authAPI = {
  register:       (data) => API.post('/auth/register', data),
  login:          (data) => API.post('/auth/login', data),
  googleLogin:    (data) => API.post('/auth/google', data),
  getMe:          ()     => API.get('/auth/me'),
  updateProfile:  (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  verifyOTP:      (data) => API.post('/auth/verify-otp', data),
  resetPassword:  (data) => API.post('/auth/reset-password', data),
  saveFcmToken:   (data) => API.post('/auth/save-fcm-token', data),
};

// ══════════════════════════════════════════════════════════════
//  EXPERT API
// ══════════════════════════════════════════════════════════════
export const expertAPI = {
  getAll:          (params) => API.get('/experts', { params }),
  getById:         (id)     => API.get(`/experts/${id}`),
  apply:           (data)   => API.post('/experts/apply', data),
  addReview:       (id, data) => API.post(`/experts/${id}/reviews`, data),
  setAvailability: (online) => API.put('/experts/availability', { online }),
  getDashboard:    ()       => API.get('/experts/dashboard/me'),
};

// ══════════════════════════════════════════════════════════════
//  SESSION & PAYMENT API
// ══════════════════════════════════════════════════════════════
export const sessionAPI = {
  createOrder:       (expertId) => API.post('/payments/create-order', { expertId }),
  verifyPayment:     (data)     => API.post('/payments/verify', data),
  getMySessions:     ()         => API.get('/sessions/my'),
  getExpertRequests: ()         => API.get('/sessions/expert-requests'),
  respond:           (id, action) => API.patch(`/sessions/${id}/respond`, { action }),
  complete:          (id, data)   => API.patch(`/sessions/${id}/complete`, data || {}),
  rate:              (id, data)   => API.post(`/sessions/${id}/rate`, data),
  getMessages:       (id)         => API.get(`/sessions/${id}/messages`),
};

// ══════════════════════════════════════════════════════════════
//  ADMIN API
// ══════════════════════════════════════════════════════════════
export const adminAPI = {
  getStats:      () => API.get('/experts/admin/stats'),
  getPending:    () => API.get('/experts/admin/pending'),
  approveExpert: (id) => API.patch(`/experts/admin/${id}/approve`),
  rejectExpert:  (id) => API.patch(`/experts/admin/${id}/reject`),
};

export default API;