import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — clear token and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.patch('/auth/update-profile', data);

// ── Scores ────────────────────────────────────────────────────────────────────
export const getScores = () => API.get('/scores');
export const addScore = (data) => API.post('/scores', data);
export const deleteScore = (id) => API.delete(`/scores/${id}`);

// ── Charities ─────────────────────────────────────────────────────────────────
export const getCharities = (params) => API.get('/charities', { params });
export const getCharity = (id) => API.get(`/charities/${id}`);
export const createCharity = (data) => API.post('/charities', data);
export const updateCharity = (id, data) => API.put(`/charities/${id}`, data);
export const deleteCharity = (id) => API.delete(`/charities/${id}`);

// ── Draws ─────────────────────────────────────────────────────────────────────
export const getDraws = () => API.get('/draws');
export const getCurrentDraw = () => API.get('/draws/current');
export const simulateDraw = (data) => API.post('/draws/simulate', data);
export const publishDraw = (data) => API.post('/draws/publish', data);
export const getDrawWinners = (id) => API.get(`/draws/${id}/winners`);

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const createCheckout = (plan) => API.post('/subscriptions/create-checkout', { plan });
export const getSubscriptionStatus = () => API.get('/subscriptions/status');
export const cancelSubscription = () => API.post('/subscriptions/cancel');
export const submitUpiPayment = (data) => API.post('/subscriptions/upi-request', data);


// ── Winners ───────────────────────────────────────────────────────────────────
export const getMyWins = () => API.get('/winners/me');
export const uploadProof = (id, formData) =>
  API.post(`/winners/${id}/upload-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetUsers = (params) => API.get('/admin/users', { params });
export const adminGetUser = (id) => API.get(`/admin/users/${id}`);
export const adminUpdateUser = (id, data) => API.patch(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminGetWinners = (params) => API.get('/admin/winners', { params });
export const adminVerifyWinner = (id, data) => API.patch(`/admin/winners/${id}/verify`, data);
export const adminPayoutWinner = (id) => API.patch(`/admin/winners/${id}/payout`);
export const adminGetReports = () => API.get('/admin/reports');

export default API;
