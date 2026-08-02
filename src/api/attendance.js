import api from './axios';

export const attendanceApi = {
  checkIn:              (data)       => api.post('/attendance/check-in', data),
  checkOut:             (data)       => api.post('/attendance/check-out', data),
  getToday:             ()           => api.get('/attendance/today'),
  getEmployeeHistory:   (id, params) => api.get(`/attendance/employee/${id}`, { params }),
};
