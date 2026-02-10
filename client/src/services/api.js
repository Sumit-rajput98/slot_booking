import axios from 'axios';
import { supabase } from '../supabaseClient';


// ALWAYS point to backend root
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://slot-booking-owl6.onrender.com';


const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // 👈 IMPORTANT
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Log requests
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ======================
// AUTH PROFILE
// ======================
export const fetchProfile = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (!token) throw new Error('Not authenticated');

  const res = await api.get('/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

// ======================
// BOOKING API
// ======================
export const bookingAPI = {
  getSlots: (date) => api.get(`/slots/${date}`),

  getSlotStatus: (date) => {
    const params = {};
    if (date) params.date = date;
    return api.get('/slots/status/overall', { params });
  },

  checkWeeklyStatus: (phone, date) => {
    const params = { phone };
    if (date) params.date = date;
    return api.get('/user/weekly-status', { params });
  },

  createBooking: (bookingData) => api.post('/bookings', bookingData),

  getAllBookings: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/admin/bookings', { params });
  },

  deleteBooking: (id) => api.delete(`/admin/bookings/${id}`),

  deleteMultipleBookings: (ids) =>
    api.delete('/admin/bookings', { data: { ids } }),

  exportBookings: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return api.get('/admin/export', {
      params,
      responseType: 'blob'
    });
  },

  getStats: (date) => {
    const params = {};
    if (date) params.date = date;
    return api.get('/admin/stats', { params });
  },
};

export default api;
