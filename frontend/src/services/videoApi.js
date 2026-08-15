import api from './api'

const videoApi = {
  listVideos: (page = 1) =>
    api.get('/videos/', { params: { page } }),

  getVideo: (id) =>
    api.get(`/videos/${id}/`),

  uploadVideo: (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('video', file)
    return api.post('/videos/', formData, {
      onUploadProgress
    })
  },

  deleteVideo: (id) =>
    api.delete(`/videos/${id}/`),

  extractFrames: (id, settings = {}) =>
    api.post(`/videos/${id}/extract_frames/`, settings)
}

const imageApi = {
  listImages: (page = 1, videoName = null) => {
    const params = { page }
    if (videoName) params.video_name = videoName
    return api.get('/images/', { params })
  },

  getImage: (id) =>
    api.get(`/images/${id}/`),

  deleteImage: (id) =>
    api.delete(`/images/${id}/`),

  filterByVideo: (videoName) =>
    api.get('/images/by_video/', { params: { video_name: videoName } }),

  captureFrame: ({ blob, timestamp, width, height, videoId, videoName, extension }) => {
    const ext = extension || 'png'
    const formData = new FormData()
    formData.append('image', blob, `frame_${timestamp.toFixed(3)}.${ext}`)
    formData.append('video_id', videoId)
    formData.append('timestamp', timestamp)
    formData.append('width', width)
    formData.append('height', height)
    formData.append('video_name', videoName)
    return api.post('/images/capture_frame/', formData)
  },

  exportToFolder: (imageIds) =>
    api.post('/images/export_to_folder/', { image_ids: imageIds })
}

const aiApi = {
  askQuestion: (question) =>
    api.post('/ai/ask/', { question })
}

export { videoApi, imageApi, aiApi }
export default videoApi
