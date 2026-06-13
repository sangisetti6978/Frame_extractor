export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 50
}

export const validatePassword = (password) => {
  return password.length >= 8
}

export const validateVideoFile = (file) => {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime']
  return validTypes.includes(file.type)
}
