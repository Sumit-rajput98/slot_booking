import http from './http';

export const bookingAPI = {
  getSlots: (date) => http.get(`/slots/${date}`),

  getSlotStatus: (date) => {
    const params = {};
    if (date) params.date = date;
    return http.get('/slots/status/overall', { params });
  },

  checkWeeklyStatus: (phone, date) => {
    const params = { phone };
    if (date) params.date = date;
    return http.get('/user/weekly-status', { params });
  },

  createBooking: (bookingData) => http.post('/bookings', bookingData),

  getAllBookings: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/bookings', { params });
  },

  deleteBooking: (id) => http.delete(`/admin/bookings/${id}`),

  deleteMultipleBookings: (ids) => http.delete('/admin/bookings', { data: { ids } }),

  exportBookings: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return http.get('/admin/export', {
      params,
      responseType: 'blob',
    });
  },

  getStats: (date) => {
    const params = {};
    if (date) params.date = date;
    return http.get('/admin/stats', { params });
  },
};
