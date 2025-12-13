import axios from 'axios'
import { getToken } from '../utils/auth'

const API_BASE_URL = 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data)
}

export const clinicAPI = {
  getAll: () => api.get('/clinics'),
  getById: (id) => api.get(`/clinics/${id}`)
}

export const tokenAPI = {
  book: (clinicId, data) => api.post(`/tokens/clinic/${clinicId}`, data),
  getQueue: (clinicId) => api.get(`/tokens/clinic/${clinicId}/queue`),
  getMyToken: (clinicId) => api.get(`/tokens/clinic/${clinicId}/my-token`),
  cancel: (tokenId) => api.delete(`/tokens/${tokenId}`)
}

export const receptionistAPI = {
  getQueue: (clinicId) => api.get(`/receptionist/clinic/${clinicId}/queue`),
  updateStatus: (tokenId, status) => api.put(`/receptionist/token/${tokenId}/status`, { status }),
  serveNext: (clinicId) => api.post(`/receptionist/clinic/${clinicId}/serve-next`),
  removeToken: (tokenId) => api.delete(`/receptionist/token/${tokenId}`)
}

export default api