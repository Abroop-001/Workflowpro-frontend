import api from './axios';

export const auditLogApi = {
  getAll:         (params)   => api.get('/audit-logs', { params }),
  getUserActivity:(userId)   => api.get(`/audit-logs/user/${userId}`),
  getModuleHistory:(module)  => api.get(`/audit-logs/module/${module}`),
};
