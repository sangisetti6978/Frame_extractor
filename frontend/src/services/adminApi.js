import api from './api'

const adminApi = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: (search = '') => api.get('/admin/users/', { params: search ? { search } : {} }),
  toggleUser: (userId) => api.patch(`/admin/users/${userId}/toggle/`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}/delete/`),
  getVideos: (search = '') => api.get('/admin/videos/', { params: search ? { search } : {} }),
  deleteVideo: (videoId) => api.delete(`/admin/videos/${videoId}/delete/`),
  getFrames: (search = '') => api.get('/admin/frames/', { params: search ? { search } : {} }),
  deleteFrame: (frameId) => api.delete(`/admin/frames/${frameId}/delete/`),
  getActivity: () => api.get('/admin/activity/'),
  // Help Desk
  getHelpContent: () => api.get('/help/'),
  updateHelpContent: (section, formData) => api.post(`/help/${section}/update/`, formData),
  clearHelpVideo: (section) => api.delete(`/help/${section}/clear-video/`),
}

export default adminApi

