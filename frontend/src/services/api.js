const apiUrl = import.meta.env.VITE_API_URL || 'https://carbstracker.onrender.com/api'

const request = async (path, options = {}) => {
  const token = localStorage.getItem('carbs_token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const trimmedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
  const response = await fetch(`${trimmedApiUrl}${path}`, { ...options, headers, mode: 'cors' })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'API Error')
  return data
}

export const api = {
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  get: (path) => request(path, { method: 'GET' }),
  request
}
