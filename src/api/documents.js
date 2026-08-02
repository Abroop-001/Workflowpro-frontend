import api from './axios';

export const documentApi = {
  upload:              (formData) => api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getEmployeeDocs:     (empId)    => api.get(`/documents/employee/${empId}`),
  download:            (id)       => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete:              (id)       => api.delete(`/documents/${id}`),
};
