import API from './axios.js';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  API.post('/login', { email, password });

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getAnalytics = (period) => API.get('/analytics', { params: period ? { period } : {} });

// ─── Hostels ──────────────────────────────────────────────────────────────────
export const getHostels = (params) => API.get('/hostels', { params });
export const getHostelById = (id) => API.get(`/hostels/${id}`);
export const updateHostelStatus = (id, status) =>
  API.patch(`/hostels/${id}/status`, { status });

// ─── Owners ───────────────────────────────────────────────────────────────────
export const getOwners = (params) => API.get('/owners', { params });
export const updateOwnerStatus = (id, action) =>
  API.patch(`/owners/${id}/status`, { action });

// ─── Admin Profile ──────────────────────────────────────────────────────────
export const uploadAdminProfileImage = (formData) =>
  API.post('/profile-image', formData);
