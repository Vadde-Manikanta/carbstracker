import { api } from './api.js'

export const login = async (values) => api.post('/auth/login', values)
export const register = async (values) => api.post('/auth/register', values)
export const fetchDashboard = async () => api.get('/user/dashboard')
export const updateProfile = async (values) => api.put('/user/profile', values)
export const addDailyLog = async (values) => api.post('/user/log', values)
export const getIndianDietPlan = async () => api.get('/user/diet-plan')
export const updateQuote = async (text) => api.put('/admin/quote', { text })
export const fetchUsers = async () => api.get('/admin/users')
export const fetchStats = async () => api.get('/admin/stats')
export const deleteUser = async (userId) => api.delete(`/admin/users/${userId}`)
export const resetUserStreak = async (userId) => api.put(`/admin/users/${userId}/reset-streak`)
