import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/auth.js'
import '../styles/RegisterPage.css'

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: 'male', weight: '', height: '', activityLevel: 'sedentary', goal: 'fat_loss', deficit: 400, stepsGoal: 10000
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: ['age', 'weight', 'height', 'deficit', 'stepsGoal'].includes(name) ? Number(value) : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await register(form)
      localStorage.setItem('carbs_token', data.token)
      localStorage.setItem('carbs_role', data.user.role)
      localStorage.setItem('carbs_user', data.user.email)
      window.dispatchEvent(new Event('carbs-auth'))
      setSuccess('Account created. Redirecting...')
      setTimeout(() => navigate(data.user.role === 'admin' ? '/admin' : '/dashboard'), 800)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card p-4 shadow-sm">
          <h2 className="mb-3 text-neon">Register</h2>
          <p className="text-muted">Create your personalized calorie and fat-loss plan.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row gy-3">
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" required minLength="6" />
              </div>
              <div className="col-md-6">
                <label className="form-label">Age</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} className="form-control" min="12" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="form-select">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Weight (kg)</label>
                <input type="number" name="weight" value={form.weight} onChange={handleChange} className="form-control" min="30" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Height (cm)</label>
                <input type="number" name="height" value={form.height} onChange={handleChange} className="form-control" min="120" required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Activity Level</label>
                <select name="activityLevel" value={form.activityLevel} onChange={handleChange} className="form-select">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Goal</label>
                <select name="goal" value={form.goal} onChange={handleChange} className="form-select">
                  <option value="fat_loss">Fat Loss</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Daily Steps Goal</label>
                <select name="stepsGoal" value={form.stepsGoal} onChange={handleChange} className="form-select">
                  <option value={5000}>5,000 steps</option>
                  <option value={7000}>7,000 steps</option>
                  <option value={10000}>10,000 steps</option>
                  <option value={12000}>12,000 steps</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Daily Deficit (Fat Loss Only)</label>
                <input type="number" name="deficit" value={form.deficit} onChange={handleChange} className="form-control" min="200" max="700" />
              </div>
              <div className="col-md-12">
                <label className="form-label">Daily Deficit (Fat Loss Only)</label>
                <input type="number" name="deficit" value={form.deficit} onChange={handleChange} className="form-control" min="200" max="700" />
              </div>
            </div>
            <button className="btn btn-primary mt-4 w-100">Create account</button>
          </form>
          <div className="mt-3 text-center small-text">
            Already registered? <Link to="/login">Login</Link>
          </div>
          <div className="mt-2 text-center small-text text-muted">Admin accounts must use the dedicated admin login page and cannot be created here.</div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
