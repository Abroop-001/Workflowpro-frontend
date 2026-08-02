import api from './axios';

export const salaryStructureApi = {
  getAll:           (params)   => api.get('/salary-structures', { params }),
  getByEmployee:    (empId)    => api.get(`/salary-structures/employee/${empId}`),
  create:           (data)     => api.post('/salary-structures', data),
  update:           (id, data) => api.patch(`/salary-structures/${id}`, data),
  deactivate:       (id)       => api.delete(`/salary-structures/${id}`),
};

export const payrollApi = {
  generate:           (data)   => api.post('/payroll/generate', data),
  getAll:             (params) => api.get('/payroll', { params }),
  getById:            (id)     => api.get(`/payroll/${id}`),
  getByEmployee:      (empId, params) => api.get(`/payroll/employee/${empId}`, { params }),
  approve:            (id)     => api.patch(`/payroll/${id}/approve`),
  markPaid:           (id, data) => api.patch(`/payroll/${id}/pay`, data),
  cancel:             (id)     => api.patch(`/payroll/${id}/cancel`),
};
