import api from './axios';

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register-company', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh-token'),
};