import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import CalculatorPage from './pages/CalculatorPage.jsx'
import DietPage from './pages/DietPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

const getAuthState = () => ({
  token: localStorage.getItem('carbs_token'),
  role: localStorage.getItem('carbs_role')
})

const App = () => {
  const [auth, setAuth] = useState(getAuthState)

  useEffect(() => {
    const handleAuthChanged = () => setAuth(getAuthState())
    window.addEventListener('storage', handleAuthChanged)
    window.addEventListener('carbs-auth', handleAuthChanged)
    return () => {
      window.removeEventListener('storage', handleAuthChanged)
      window.removeEventListener('carbs-auth', handleAuthChanged)
    }
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <NavBar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={auth.token ? (auth.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />} />
          <Route path="/login" element={auth.token ? (auth.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />) : <LoginPage />} />
          <Route path="/register" element={auth.token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/calculator" element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>} />
          <Route path="/diet" element={<ProtectedRoute><DietPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
