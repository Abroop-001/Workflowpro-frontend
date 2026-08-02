import api from './axios';

export const leaveApi = {
  create:              (data)   => api.post('/leaves', data),
  approve:             (id, data) => api.patch(`/leaves/${id}/approve`, data),
  reject:              (id, data) => api.patch(`/leaves/${id}/reject`, data),
  cancel:              (id, data) => api.patch(`/leaves/${id}/cancel`, data),
  getEmployeeLeaves:   (employeeId, params) => api.get(`/leaves/employee/${employeeId}`, { params }),
};
