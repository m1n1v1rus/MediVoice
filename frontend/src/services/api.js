import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const AI_URL = import.meta.env.VITE_AI_REST_URL || 'http://localhost:8000'

const API = axios.create({ baseURL: API_URL })
const AI = axios.create({ baseURL: AI_URL })

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mv_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mv_token')
      localStorage.removeItem('mv_clinic')
    }
    return Promise.reject(error)
  }
)

// Auth
export const loginClinic = (data) => API.post('/auth/login', data)
export const registerClinic = (data) => API.post('/auth/register', data)

// Doctors
export const getDoctors = () => API.get('/doctors')
export const addDoctor = (data) => API.post('/doctors', data)
export const updateDoctor = (id, data) => API.put(`/doctors/${id}`, data)
export const deleteDoctor = (id) => API.put(`/doctors/${id}`, { isAvailable: false })
export const getAvailableDoctors = (spec, date) =>
  API.get('/doctors/available', { params: { specialization: spec, date } })
export const searchDoctors = (name) => API.get('/doctors/search', { params: { name } })

// Appointments
export const getAppointments = () => API.get('/appointments')
export const cancelAppointment = (id) => API.patch(`/appointments/${id}`, { status: 'cancelled' })
export const rescheduleAppointment = (id, data) => API.patch(`/appointments/${id}/reschedule`, data)
export const getPatientAppointments = (phone) => API.get(`/appointments/patient/${phone}`)

// Analytics
export const getAnalytics = () => API.get('/analytics/dashboard')

// Call Logs
export const getCallLogs = () => API.get('/calls')
export const getCallLogById = (id) => API.get(`/calls/${id}`)

// AI Service — Direct calls (text mode)
export const sendTextToAI = (data) => AI.post('/process-text', data)
export const getAIHealth = () => AI.get('/health')
export const chatWithAI = async (text, sessionId, language) => {
  const response = await AI.post('/process-text', { text, session_id: sessionId, language })
  return response.data
}
export const endAICall = (sessionId) => AI.post('/end-call', { session_id: sessionId })