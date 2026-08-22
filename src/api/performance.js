import api from './axios';

export const performanceApi = {
  create:               (data)     => api.post('/performance', data),
  getByEmployee:        (empId)    => api.get(`/performance/employee/${empId}`),
  getById:              (id)       => api.get(`/performance/${id}`),
  submitSelfReview:     (id, data) => api.patch(`/performance/${id}/self-review`, data),
  submitManagerReview:  (id, data) => api.patch(`/performance/${id}/manager-review`, data),
  updateGoalStatus:     (id, data) => api.patch(`/performance/${id}/goals`, data),
  update:               (id, data) => api.patch(`/performance/${id}`, data),
  delete:               (id)       => api.delete(`/performance/${id}`),
};
