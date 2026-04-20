import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import '../styles/NavBar.css'

const NavBar = () => {
  const [token, setToken] = useState(localStorage.getItem('carbs_token'))
  const [role, setRole] = useState(localStorage.getItem('carbs_role'))
  const navigate = useNavigate()

  useEffect(() => {
    const updateAuth = () => {
      setToken(localStorage.getItem('carbs_token'))
      setRole(localStorage.getItem('carbs_role'))
    }
    window.addEventListener('storage', updateAuth)
    window.addEventListener('carbs-auth', updateAuth)
    return () => {
      window.removeEventListener('storage', updateAuth)
      window.removeEventListener('carbs-auth', updateAuth)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('carbs_token')
    localStorage.removeItem('carbs_user')
    localStorage.removeItem('carbs_role')
    setToken(null)
    setRole(null)
    window.dispatchEvent(new Event('carbs-auth'))
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark py-3">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to={token ? '/dashboard' : '/login'}>🥗 Carbs Tracker</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-center">
            {token ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/calculator">📊 Calculator</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dashboard">📈 Dashboard</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/diet">🍽️ Diet Plan</NavLink>
                </li>
                {role === 'admin' && (
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/admin">⚙️ Admin</NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm ms-2" onClick={logout}>🚪 Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">🔑 Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">✍️ Register</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
