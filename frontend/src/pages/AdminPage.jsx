import { useEffect, useState } from 'react'
import { fetchUsers, fetchStats, updateQuote, deleteUser, resetUserStreak } from '../services/auth.js'
import '../styles/AdminPage.css'

const AdminPage = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [quote, setQuote] = useState('')
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      const [userData, statData] = await Promise.all([fetchUsers(), fetchStats()])
      setUsers(userData.users)
      setStats(statData)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateQuote = async (e) => {
    e.preventDefault()
    try {
      await updateQuote(quote)
      setMessage('Quote updated successfully')
      setError('')
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId)
      setMessage('User removed.')
      setError('')
      loadAdminData()
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  const handleResetStreak = async (userId) => {
    try {
      await resetUserStreak(userId)
      setMessage('Streak reset.')
      setError('')
      loadAdminData()
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  return (
    <div className="row gy-4">
      <div className="col-xl-4">
        <div className="card p-4 shadow-sm">
          <h4 className="text-neon">Admin Analytics</h4>
          {stats ? (
            <ul className="list-group list-group-flush mt-3 text-light">
              <li className="list-group-item bg-transparent border-secondary">Total users: {stats.totalUsers}</li>
              <li className="list-group-item bg-transparent border-secondary">Active today: {stats.activeUsers}</li>
              <li className="list-group-item bg-transparent border-secondary">Average streak: {stats.averageStreak}</li>
              <li className="list-group-item bg-transparent border-secondary">Users with logs: {stats.usersWithLogs}</li>
            </ul>
          ) : (
            <p>Loading stats...</p>
          )}
        </div>
      </div>
      <div className="col-xl-8">
        <div className="card p-4 shadow-sm">
          <h4 className="text-neon">Motivational Quote</h4>
          <form onSubmit={handleUpdateQuote} className="row g-3 mt-2">
            <div className="col-12">
              <textarea className="form-control" rows="3" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="Enter a new daily quote" />
            </div>
            <div className="col-auto">
              <button className="btn btn-primary">Update quote</button>
            </div>
          </form>
          {message && <div className="alert alert-success mt-3">{message}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
      </div>
      <div className="col-xl-12">
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="text-neon mb-0">Registered Users</h4>
              <p className="small-text mb-0">Search, reset streaks, and remove accounts.</p>
            </div>
            <div className="w-50">
              <input value={query} onChange={(e) => setQuery(e.target.value)} className="form-control" placeholder="Search by name or email" />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-dark table-borderless align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Goal</th>
                  <th>Activity</th>
                  <th>Streak</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.filter((user) => !query || user.name.toLowerCase().includes(query.toLowerCase()) || user.email.toLowerCase().includes(query.toLowerCase())).map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.goal.replace('_', ' ')}</td>
                    <td>{user.activityLevel}</td>
                    <td>{user.streakCount}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-secondary me-2" onClick={() => handleResetStreak(user._id)}>Reset Streak</button>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
