import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/auth.js'
import '../styles/LoginPage.css'

const AdminLoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await login({ email, password })
      if (response.user.role !== 'admin') {
        setError('Admin credentials required.')
        return
      }
      localStorage.setItem('carbs_token', response.token)
      localStorage.setItem('carbs_role', response.user.role)
      localStorage.setItem('carbs_user', response.user.email)
      window.dispatchEvent(new Event('carbs-auth'))
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card p-4 shadow-sm">
          <h2 className="mb-3 text-neon">Admin Login</h2>
          <p className="small-text">Only use this page if you are the app administrator.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleAdminLogin}>
            <div className="mb-3">
              <label className="form-label">Admin Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Sign in as admin</button>
          </form>
          <div className="mt-3 text-center small-text">
            <Link to="/login">Back to user login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
