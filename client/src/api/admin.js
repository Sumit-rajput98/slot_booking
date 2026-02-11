import http from './http';

export const adminAPI = {
  // Bookings
  getAllBookings: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/bookings', { params });
  },

  deleteBooking: (id) => {
    return http.delete(`/admin/bookings/${id}`);
  },

  deleteMultipleBookings: (ids) => {
    return http.delete('/admin/bookings', { data: { ids } });
  },

  updateBookingStatus: (id, status) => {
    return http.put(`/admin/bookings/${id}/status`, { status });
  },

  // Stats & Analytics
  getStats: () => {
    return http.get('/admin/stats');
  },

  getAnalytics: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/analytics', { params });
  },

  // Export
  exportBookings: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/export', { 
      params,
      responseType: 'blob'
    });
  },

  // User Management
  getAllUsers: (role, search, limit, offset) => {
    const params = {};
    if (role) params.role = role;
    if (search) params.search = search;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return http.get('/admin/users', { params });
  },

  getUserById: (id) => {
    return http.get(`/admin/users/${id}`);
  },

  updateUserRole: (id, role) => {
    return http.put(`/admin/users/${id}/role`, { role });
  },

  deleteUser: (id) => {
    return http.delete(`/admin/users/${id}`);
  },

  getUserStats: () => {
    return http.get('/admin/users/stats');
  },

  // Audit Logs
  getAuditLogs: (filters) => {
    return http.get('/admin/audit-logs', { params: filters });
  },

  getAuditStats: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/audit-logs/stats', { params });
  },

  exportAuditLogs: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/audit-logs/export', { 
      params,
      responseType: 'blob'
    });
  }
};
