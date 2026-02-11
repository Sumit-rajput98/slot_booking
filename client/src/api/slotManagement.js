import http from './http';

export const slotManagementAPI = {
  // Slot Configurations
  getSlotConfigurations: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/slot-management/configurations', { params });
  },

  createSlotConfiguration: (data) => {
    return http.post('/admin/slot-management/configuration', data);
  },

  updateSlotConfiguration: (id, data) => {
    return http.put(`/admin/slot-management/configuration/${id}`, data);
  },

  deleteSlotConfiguration: (id) => {
    return http.delete(`/admin/slot-management/configuration/${id}`);
  },

  // Recurring Rules
  getRecurringRules: () => {
    return http.get('/admin/slot-management/recurring-rules');
  },

  createRecurringRule: (data) => {
    return http.post('/admin/slot-management/recurring-rule', data);
  },

  updateRecurringRule: (id, data) => {
    return http.put(`/admin/slot-management/recurring-rule/${id}`, data);
  },

  deleteRecurringRule: (id) => {
    return http.delete(`/admin/slot-management/recurring-rule/${id}`);
  },

  // Availability
  getSlotAvailability: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return http.get('/admin/slot-management/availability', { params });
  }
};
