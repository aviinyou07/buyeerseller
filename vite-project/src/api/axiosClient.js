import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export const getApiAssetUrl = (url) => {
  if (!url || /^https?:\/\//i.test(url) || url.startsWith('data:')) return url

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '')
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  if (token) {
    if (config.headers.set) {
      config.headers.set('Authorization', `Bearer ${token}`)
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export default axiosClient
