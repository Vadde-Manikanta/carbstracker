import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, adminOnly }) => {
  const token = localStorage.getItem('carbs_token')
  const role = localStorage.getItem('carbs_role')

  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default ProtectedRoute
