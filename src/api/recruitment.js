import api from './axios';

export const recruitmentApi = {
  // Interviews only
  getInterviews: () => api.get('/recruitment/interviews'),
  scheduleInterview: (data) => api.post('/recruitment/interviews', data),
  getInterviewById: (id) => api.get(`/recruitment/interviews/${id}`),
  updateInterviewStatus: (id, status) => api.patch(`/recruitment/interviews/${id}/status`, { status }),
};
