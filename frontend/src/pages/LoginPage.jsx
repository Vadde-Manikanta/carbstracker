import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/auth.js'
import '../styles/LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await login({ email, password })
      localStorage.setItem('carbs_token', response.token)
      localStorage.setItem('carbs_role', response.user.role)
      localStorage.setItem('carbs_user', response.user.email)
      window.dispatchEvent(new Event('carbs-auth'))
      navigate(response.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card p-4 shadow-sm">
          <h2 className="mb-3 text-neon">Login</h2>
          <p className="text-muted">Login to access your calorie tracker, daily metrics, and fitness dashboard.</p>
          <p className="small-text">💡 Pro Tip: Admin users will automatically be directed to the admin dashboard upon login.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
          <div className="mt-3 text-center small-text">
            Don’t have an account? <Link to="/register">Register now</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
