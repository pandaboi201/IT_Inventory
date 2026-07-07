import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// Users
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Devices
export const getDevices = (params) => api.get('/devices', { params });
export const getDevice = (id) => api.get(`/devices/${id}`);
export const createDevice = (data) => api.post('/devices', data);
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data);
export const deleteDevice = (id) => api.delete(`/devices/${id}`);
export const getDeviceCategories = () => api.get('/devices/categories/all');

// Assignments
export const getAssignments = (params) => api.get('/assignments', { params });
export const createAssignment = (data) => api.post('/assignments', data);
export const returnDevice = (id, data) => api.put(`/assignments/${id}/return`, data);

// Repairs
export const getRepairs = (params) => api.get('/repairs', { params });
export const createRepair = (data) => api.post('/repairs', data);
export const updateRepair = (id, data) => api.put(`/repairs/${id}`, data);

// Upgrades
export const getUpgrades = (params) => api.get('/upgrades', { params });
export const createUpgrade = (data) => api.post('/upgrades', data);

// Parts
export const getParts = (params) => api.get('/parts', { params });
export const createPart = (data) => api.post('/parts', data);
export const updatePart = (id, data) => api.put(`/parts/${id}`, data);
export const usePart = (id, data) => api.post(`/parts/${id}/use`, data);
export const getPartUsage = (id) => api.get(`/parts/${id}/usage`);

// CCTV
export const getCCTVCameras = (params) => api.get('/cctv', { params });
export const createCCTVCamera = (data) => api.post('/cctv', data);
export const updateCCTVCamera = (id, data) => api.put(`/cctv/${id}`, data);
export const getCCTVMaintenance = (id) => api.get(`/cctv/${id}/maintenance`);
export const createCCTVMaintenance = (id, data) => api.post(`/cctv/${id}/maintenance`, data);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRecentActivity = (limit) => api.get(`/dashboard/recent-activity?limit=${limit}`);

export default api;
