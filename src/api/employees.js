import api from './axios';

export const employeeApi = {
  getAll:       (params)   => api.get('/employees', { params }),
  getById:      (id)       => api.get(`/employees/${id}`),
  create:       (data)     => api.post('/employees', data),
  update:       (id, data) => api.patch(`/employees/${id}`, data),
  deactivate:   (id)       => api.patch(`/employees/${id}/deactivate`),
};
