import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api' })
const AI = axios.create({ baseURL: 'http://localhost:6001/api' })

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mv_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Auth
export const loginClinic = (data) => API.post('/auth/login', data)
export const registerClinic = (data) => API.post('/auth/register', data)

// Doctors
export const getDoctors = () => API.get('/doctors')
export const addDoctor = (data) => API.post('/doctors', data)
export const deleteDoctor = (id) => API.delete(`/doctors/${id}`)
export const getAvailableDoctors = (spec, date) =>
  API.get('/doctors/available', { params: { specialization: spec, date } })

// Appointments
export const getAppointments = () => API.get('/appointments')
export const cancelAppointment = (id) => API.put(`/appointments/${id}/cancel`)
export const getPatientAppointments = (phone) => API.get(`/appointments/patient/${phone}`)

// Analytics
export const getAnalytics = () => API.get('/analytics')

// AI Voice
export const sendVoiceMessage = (data) => AI.post('/voice/chat', data)
export const endVoiceSession = (data) => AI.post('/voice/end-session', data)