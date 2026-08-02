import api from './axios';

export const recruitmentApi = {
  // Candidate CRUD
  createCandidate: (data) => api.post('/recruitment', data),
  getCandidates: (params) => api.get('/recruitment', { params }),
  getCandidateById: (id) => api.get(`/recruitment/${id}`),
  updateCandidate: (id, data) => api.patch(`/recruitment/${id}`, data),
  updateStage: (id, stage) => api.patch(`/recruitment/${id}/stage`, { stage }),
  addNote: (id, comment) => api.post(`/recruitment/${id}/notes`, { comment }),
  archiveCandidate: (id) => api.delete(`/recruitment/${id}`),
  hireCandidate: (id, data) => api.post(`/recruitment/${id}/hire`, data),

  // Interviews
  getInterviews: () => api.get('/recruitment/interviews'),
  scheduleInterview: (data) => api.post('/recruitment/interviews', data),
  getInterviewById: (id) => api.get(`/recruitment/interviews/${id}`),
  getCandidateInterviews: (candidateId) => api.get(`/recruitment/interviews/candidate/${candidateId}`),
  updateInterviewStatus: (id, status) => api.patch(`/recruitment/interviews/${id}/status`, { status }),
  submitFeedback: (id, feedback) => api.patch(`/recruitment/interviews/${id}/feedback`, feedback),
  rescheduleInterview: (id, data) => api.patch(`/recruitment/interviews/${id}/reschedule`, data),
};
