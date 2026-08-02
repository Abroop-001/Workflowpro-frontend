import api from './axios';

export const payslipApi = {
  generate:           (data)   => api.post('/payslips/generate', data),
  getEmployeePayslips: (empId)  => api.get(`/payslips/employee/${empId}`),
  getById:            (id)     => api.get(`/payslips/${id}`),
  downloadPdf:        (id)     => api.get(`/payslips/${id}/download`, { responseType: 'blob' }),
};
