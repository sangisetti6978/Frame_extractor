import api from './api'

export const configApi = {
  getConfig: () =>
    api.get('/config/'),

  updateConfig: (data) =>
    api.put('/config/', data),

  getFolders: () =>
    api.get('/config/folders/'),

  createFolder: (data) =>
    api.post('/config/folders/', data),

  deleteFolder: (id) =>
    api.delete(`/config/folders/${id}/`)
}

export default configApi
