import api from './api'

const authApi = {
  register: (username, email, password) =>
    api.post('/auth/register/', { username, email, password }),

  login: (username, password) =>
    api.post('/auth/login/', { username, password }),

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () =>
    api.get('/auth/user/')
}

export default authApi
