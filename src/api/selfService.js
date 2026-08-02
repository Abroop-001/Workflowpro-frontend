import api from './axios';

export const selfServiceApi = {
  getProfile:      ()         => api.get('/self-service/profile'),
  getAttendance:   (params)   => api.get('/self-service/attendance', { params }),
  getLeaveBalance: (year)     => api.get('/self-service/leave-balance', { params: year ? { year } : {} }),
  getLeaves:       ()         => api.get('/self-service/leaves'),
  getPayslips:     ()         => api.get('/self-service/payslips'),
  getDocuments:    ()         => api.get('/self-service/documents'),
};
