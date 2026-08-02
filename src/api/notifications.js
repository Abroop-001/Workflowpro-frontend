import api from './axios';

export const notificationApi = {
  getAll:         (params) => api.get('/notifications', { params }),
  getUnreadCount: ()       => api.get('/notifications/unread-count'),
  markAsRead:     (id)     => api.patch(`/notifications/${id}/read`),
  create:         (data)   => api.post('/notifications', data),
};
