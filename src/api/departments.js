import api from './axios';

export const departmentApi = {
  getAll:       (params)   => api.get('/departments', { params }),
  getById:      (id)       => api.get(`/departments/${id}`),
  getDetails:   (id)       => api.get(`/departments/${id}/details`),
  create:       (data)     => api.post('/departments', data),
  update:       (id, data) => api.patch(`/departments/${id}`, data),
  deactivate:   (id)       => api.patch(`/departments/${id}/deactivate`),
};
