const apiUrl = import.meta.env.VITE_API_URL || '/api'

const request = async (path, options = {}) => {
  const token = localStorage.getItem('carbs_token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${apiUrl}${path}`, { ...options, headers })
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
