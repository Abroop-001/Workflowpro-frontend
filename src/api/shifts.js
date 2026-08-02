import api from './axios';

export const shiftApi = {
  getAll:       (params)   => api.get('/shifts', { params }),
  getById:      (id)       => api.get(`/shifts/${id}`),
  create:       (data)     => api.post('/shifts', data),
  update:       (id, data) => api.patch(`/shifts/${id}`, data),
  deactivate:   (id)       => api.patch(`/shifts/${id}/deactivate`),
};
