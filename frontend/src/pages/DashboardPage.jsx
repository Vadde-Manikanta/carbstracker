import { useEffect, useState } from 'react'
import { Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { fetchDashboard, updateProfile, addDailyLog } from '../services/auth.js'
import '../styles/DashboardPage.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

const DashboardPage = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState(null)
  const [logForm, setLogForm] = useState({ caloriesConsumed: '', steps: '', joggingCalories: '', weight: '', notes: '' })
  const [loggingMode, setLoggingMode] = useState(false)

  const loadDashboard = async () => {
    try {
      const result = await fetchDashboard()
      setData(result)
      setError('')
      setProfileForm({
        name: result.profile.name || '',
        age: result.profile.age || 0,
        gender: result.profile.gender || 'male',
        weight: result.profile.weight || 0,
        startWeight: result.profile.startWeight || result.profile.weight || 0,
        height: result.profile.height || 0,
        activityLevel: result.profile.activityLevel || 'moderate',
        goal: result.profile.goal || 'fat_loss',
        deficit: result.profile.deficit || 400,
        stepsGoal: result.profile.stepsGoal || 10000
      })
      
      // Load today's existing log into the form (if it exists)
      const todayDate = new Date().toISOString().slice(0, 10)
      const todayLog = result.profile.logs.find((log) => log.date === todayDate) || {}
      setLogForm({
        caloriesConsumed: todayLog.caloriesConsumed || '',
        steps: todayLog.steps || '',
        joggingCalories: todayLog.joggingCalories || '',
        weight: todayLog.weight || '',
        notes: todayLog.notes || ''
      })
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  if (error) return <div className="alert alert-danger">⚠️ {error}</div>
  if (!data || !profileForm) return <div className="text-center py-5">⏳ Loading dashboard...</div>

  const { profile, metrics, todayLog, quote } = data
  const streak = profile.streakCount || 0

  // Macro chart data
  const macroChartData = {
    labels: ['Protein', 'Fat', 'Carbs'],
    datasets: [{
      data: [metrics.macros.proteinCalories, metrics.macros.fatCalories, metrics.macros.carbCalories],
      backgroundColor: ['#0ea5e9', '#f97316', '#06b6d4']
    }]
  }

  // Weight history chart - Enhanced with better visualization
  const sortedLogs = [...(profile.logs || [])].sort((a, b) => a.date.localeCompare(b.date))
  
  // Calculate weight change using startWeight from profile
  // IMPORTANT: startWeight should NEVER change once set at registration
  const startWeight = profile.startWeight !== undefined && profile.startWeight !== null ? profile.startWeight : profile.weight
  const currentWeight = profile.weight
  const weightChange = (currentWeight - startWeight).toFixed(1)
  const isWeightDown = weightChange < 0
  
  // Enhanced weight chart with trend line and start weight reference
  // --- Improved chart logic ---
  // Always show a curve from start to current, even if only two points

  // --- Show full weight journey: start, all logs, current ---
  let weightLabels = []
  let weightData = []
  if (sortedLogs.length > 0) {
    // Always start with start weight
    weightLabels = [profile.startWeightDate || 'Start']
    weightData = [profile.startWeight]
    // Add every log as a point
    sortedLogs.forEach((log) => {
      weightLabels.push(log.date)
      weightData.push(log.weight)
    })
    // Always end with current weight if not already last
    if (weightLabels[weightLabels.length - 1] !== 'Today' && profile.weight !== weightData[weightData.length - 1]) {
      weightLabels.push('Today')
      weightData.push(profile.weight)
    }
  } else {
    // No logs, just show start and current
    weightLabels = [profile.startWeightDate || 'Start', 'Today']
    weightData = [profile.startWeight, profile.weight]
  }

  // Calculate min/max for Y axis
  const allWeights = [...weightData].filter((w) => typeof w === 'number' && !isNaN(w))
  const minWeight = Math.floor(Math.min(...allWeights, profile.startWeight, profile.weight))
  const maxWeight = Math.ceil(Math.max(...allWeights, profile.startWeight, profile.weight))

  const weightChartData = {
    labels: weightLabels,
    datasets: [
      {
        label: 'Daily Weight (kg)',
        data: weightData,
        borderColor: isWeightDown ? '#10b981' : '#ef4444',
        backgroundColor: isWeightDown ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: isWeightDown ? '#10b981' : '#ef4444',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        fill: true,
        borderWidth: 3,
        spanGaps: true
      },
      {
        label: 'Start Weight (Reference)',
        data: Array(weightLabels.length).fill(profile.startWeight || profile.weight),
        borderColor: '#64748b',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }
    ]
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: ['weight', 'height', 'deficit', 'stepsGoal', 'age'].includes(name) ? Number(value) : value
    }))
  }

  const handleLogChange = (e) => {
    const { name, value } = e.target
    // FIX: Properly handle numeric values including 0
    const numericFields = ['caloriesConsumed', 'steps', 'joggingCalories', 'weight']
    setLogForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) 
        ? (value === '' ? '' : Number(value)) // Correctly handle 0 values
        : value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(profileForm)
      setMessage('✅ Profile saved successfully!')
      setError('')
      setEditMode(false)
      setTimeout(() => loadDashboard(), 500)
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  const handleSaveLog = async (e) => {
    e.preventDefault()
    try {
      const logData = {
        date: new Date().toISOString().slice(0, 10),
        caloriesConsumed: logForm.caloriesConsumed || 0,
        steps: logForm.steps || 0,
        joggingCalories: logForm.joggingCalories || 0,
        weight: logForm.weight || undefined,
        notes: logForm.notes || ''
      }
      await addDailyLog(logData)
      setMessage('✅ Daily log saved successfully!')
      setError('')
      setLoggingMode(false)
      setTimeout(() => loadDashboard(), 500)
    } catch (err) {
      setError(err.message)
      setMessage('')
    }
  }

  return (
    <div className="row gy-4">
      {/* Welcome & Profile Section */}
      <div className="col-xl-12">
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h2 className="text-neon mb-2">👋 Welcome back, {profile.name}!</h2>
              <p className="small-text">Your goal is <strong>{profile.goal.replace('_', ' ')}</strong> with a <strong>{profile.activityLevel}</strong> lifestyle.</p>
            </div>
            <div className="text-end">
              <div className="small-text mb-2">🔥 Current Streak</div>
              <div className="fs-2" style={{ color: '#0ea5e9' }}>{streak} days</div>
            </div>
          </div>

          {message && <div className="alert alert-success mb-3">{message}</div>}
          {error && <div className="alert alert-danger mb-3">{error}</div>}

          {editMode ? (
            <form onSubmit={handleSaveProfile} className="row gy-3">
              <div className="col-md-4">
                <label className="form-label">Name</label>
                <input name="name" value={profileForm.name} onChange={handleProfileChange} type="text" className="form-control" required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Age</label>
                <input name="age" value={profileForm.age} onChange={handleProfileChange} type="number" className="form-control" min="13" required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Gender</label>
                <select name="gender" value={profileForm.gender} onChange={handleProfileChange} className="form-select">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Weight (kg)</label>
                <input name="weight" value={profileForm.weight} onChange={handleProfileChange} type="number" className="form-control" min="30" required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Start Weight (kg)</label>
                <input name="startWeight" value={profileForm.startWeight} onChange={handleProfileChange} type="number" className="form-control" min="30" required />
              </div>
              <div className="col-md-2">
                <label className="form-label">Height (cm)</label>
                <input name="height" value={profileForm.height} onChange={handleProfileChange} type="number" className="form-control" min="120" required />
              </div>
              <div className="col-md-3">
                <label className="form-label">Activity Level</label>
                <select name="activityLevel" value={profileForm.activityLevel} onChange={handleProfileChange} className="form-select">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Goal</label>
                <select name="goal" value={profileForm.goal} onChange={handleProfileChange} className="form-select">
                  <option value="fat_loss">Fat Loss</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="muscle_gain">Muscle Gain</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Deficit (kcal)</label>
                <input name="deficit" value={profileForm.deficit} onChange={handleProfileChange} type="number" className="form-control" min="200" max="700" />
              </div>
              <div className="col-md-2">
                <label className="form-label">Steps Goal</label>
                <input name="stepsGoal" value={profileForm.stepsGoal} onChange={handleProfileChange} type="number" className="form-control" min="3000" />
              </div>
              <div className="col-12 text-end">
                <button type="button" className="btn btn-secondary me-2" onClick={() => setEditMode(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">💾 Save Profile</button>
              </div>
            </form>
          ) : (
            <div>
              <div className="alert alert-info mb-3" role="alert">
                <small>
                  💡 <strong>Start Weight</strong> = Set at registration (change in Edit Profile only) | 
                  <strong> Current Weight</strong> = Updated daily via "Log Today's Activity"
                </small>
              </div>
              <div className="row gy-3">
              <div className="col-md-2">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Current Weight</small>
                  <small className="d-block text-muted">Today's Weight</small>
                  <div className="fs-4">{profile.weight} kg</div>
                  <small style={{ color: isWeightDown ? '#10b981' : '#ef4444' }}>
                    {isWeightDown ? '📉' : '📈'} {Math.abs(weightChange)} kg total
                  </small>
                </div>
              </div>
              <div className="col-md-2">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Start Weight</small>
                  <small className="d-block text-muted">At Registration</small>
                  <div className="fs-4">{profile.startWeight || profile.weight} kg</div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Height</small>
                  <div className="fs-4">{profile.height} cm</div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Age</small>
                  <div className="fs-4">{profile.age} yrs</div>
                </div>
              </div>
              <div className="col-md-2">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Steps Goal</small>
                  <div className="fs-4">{profile.stepsGoal}</div>
                </div>
              </div>
              <div className="col-md-2 text-end">
                <button className="btn btn-primary" onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Summary */}
      <div className="col-xl-8">
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="text-neon">📊 Daily Summary</h5>
              <p className="small-text mb-0">Scientific calorie targets based on your TDEE and fitness goal.</p>
            </div>
            <span className="badge bg-info">Real-time</span>
          </div>
          <div className="row gy-3">
            <div className="col-md-4">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Daily Target</small>
                <h4>{metrics.calorieTarget} kcal</h4>
                <div className="progress mt-2">
                  <div className="progress-bar" style={{ width: `${Math.min(100, (todayLog.caloriesConsumed || 0) / metrics.calorieTarget * 100)}%` }}>
                    {Math.round((todayLog.caloriesConsumed || 0) / metrics.calorieTarget * 100)}%
                  </div>
                </div>
                <small className="text-muted">Consumed today: {todayLog.caloriesConsumed || 0}</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Steps Goal</small>
                <h4>{profile.stepsGoal}</h4>
                <div className="progress mt-2">
                  <div className="progress-bar bg-success" style={{ width: `${Math.min(100, (todayLog.steps || 0) / profile.stepsGoal * 100)}%` }}>
                    {Math.round((todayLog.steps || 0) / profile.stepsGoal * 100)}%
                  </div>
                </div>
                <small className="text-muted">Today: {todayLog.steps || 0}</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Cardio Burn</small>
                <h4>{todayLog.joggingCalories || 0} kcal</h4>
                <div className="progress mt-2">
                  <div className="progress-bar bg-warning" style={{ width: `${Math.min(100, ((todayLog.joggingCalories || 0) / 400) * 100)}%` }}>
                    {Math.round(Math.min(100, ((todayLog.joggingCalories || 0) / 400) * 100))}%
                  </div>
                </div>
                <small className="text-muted">Goal: 200–400 kcal</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Quote */}
      <div className="col-xl-4">
        <div className="card p-4 shadow-sm h-100">
          <h5 className="text-neon mb-3">💡 Daily Motivation</h5>
          <p className="fs-6 mb-0">"{quote}"</p>
        </div>
      </div>

      {/* Macros Chart */}
      <div className="col-xl-4">
        <div className="card p-4 shadow-sm">
          <h6 className="text-neon mb-3">🥗 Macro Breakdown</h6>
          <Doughnut data={macroChartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      {/* Macro Goals */}
      <div className="col-xl-4">
        <div className="card p-4 shadow-sm">
          <h6 className="text-neon mb-3">🎯 Today's Macro Goals</h6>
          <div className="list-group">
            <div className="list-group-item bg-dark-card border-0 mb-2">
              <small className="text-muted">Protein</small>
              <div className="fs-5">{metrics.macros.proteinGrams}g</div>
            </div>
            <div className="list-group-item bg-dark-card border-0 mb-2">
              <small className="text-muted">Fat</small>
              <div className="fs-5">{metrics.macros.fatGrams}g</div>
            </div>
            <div className="list-group-item bg-dark-card border-0">
              <small className="text-muted">Carbs</small>
              <div className="fs-5">{metrics.macros.carbGrams}g</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="col-xl-12">
        <div className="card p-4 shadow-sm">
          <div className="row mb-3">
            <div className="col-md-9">
              <h6 className="text-neon mb-0">📈 Weight Progress Chart</h6>
              <small className="text-muted">Smooth curve showing your weight journey</small>
            </div>
            <div className="col-md-3 text-end">
              <div className="p-2 bg-light rounded">
                <small className="text-muted">Change</small>
                <div className="fs-5" style={{ color: isWeightDown ? '#10b981' : '#ef4444' }}>
                  {isWeightDown ? '📉' : '📈'} {Math.abs(weightChange)} kg
                </div>
              </div>
            </div>
          </div>
          <Line data={weightChartData} options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: true, position: 'bottom' } },
            elements: { line: { tension: 0.4 } }, // Smooth curves
            scales: {
              y: {
                beginAtZero: false,
                min: minWeight - 1,
                max: maxWeight + 1,
                ticks: {
                  font: { size: 12 },
                  color: '#64748b',
                  stepSize: 1,
                  callback: function(value) {
                    return Number(value).toFixed(0) + ' kg'; // Only integer kg
                  }
                },
                grid: { color: 'rgba(14, 165, 233, 0.1)' }
              },
              x: {
                ticks: { font: { size: 12 }, color: '#64748b' },
                grid: { display: false }
              }
            }
          }} />
          <div className="row mt-3">
            <div className="col-md-4">
              <div className="p-3 bg-dark-card rounded text-center">
                <small className="text-muted">Start Weight</small>
                <h5 style={{ color: '#0ea5e9' }}>{startWeight} kg</h5>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-dark-card rounded text-center">
                <small className="text-muted">Current Weight</small>
                <h5 style={{ color: '#06b6d4' }}>{currentWeight} kg</h5>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 bg-dark-card rounded text-center">
                <small className="text-muted">Total Change</small>
                <h5 style={{ color: isWeightDown ? '#10b981' : '#ef4444' }}>
                  {isWeightDown ? '−' : '+'}{Math.abs(weightChange)} kg
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Metrics & Steps Update */}
      <div className="col-xl-12">
        <div className="card p-4 shadow-sm">
          <div className="row mb-3">
            <div className="col-md-8">
              <h5 className="text-neon mb-1">📱 Log Today's Activity</h5>
              <p className="small-text mb-0">Track calories, steps, cardio, and weight to maintain consistency.</p>
            </div>
            <div className="col-md-4 text-end">
              <button className="btn btn-success btn-sm" onClick={() => setLoggingMode(!loggingMode)}>
                {loggingMode ? '✕ Close' : '+ Add Entry'}
              </button>
            </div>
          </div>

          {loggingMode ? (
            <form onSubmit={handleSaveLog} className="row gy-3">
              <div className="col-md-3">
                <label className="form-label small">Calories Consumed</label>
                <input name="caloriesConsumed" value={logForm.caloriesConsumed} onChange={handleLogChange} type="number" className="form-control" placeholder="e.g., 2000" />
              </div>
              <div className="col-md-3">
                <label className="form-label small">🚶 Steps Completed</label>
                <input name="steps" value={logForm.steps} onChange={handleLogChange} type="number" className="form-control" placeholder={`Goal: ${profile.stepsGoal}`} />
              </div>
              <div className="col-md-2">
                <label className="form-label small">🏃 Cardio (kcal)</label>
                <input name="joggingCalories" value={logForm.joggingCalories} onChange={handleLogChange} type="number" className="form-control" placeholder="e.g., 300" />
              </div>
              <div className="col-md-2">
                <label className="form-label small">⚖️ Current Weight (kg)</label>
                <small className="d-block text-muted mb-1">Updates your current weight</small>
                <input name="weight" value={logForm.weight} onChange={handleLogChange} type="number" className="form-control" placeholder="e.g., 75.5" step="0.1" min="30" />
              </div>
              <div className="col-md-2">
                <label className="form-label small">📝 Notes</label>
                <input name="notes" value={logForm.notes} onChange={handleLogChange} type="text" className="form-control" placeholder="How was your day?" />
              </div>
              <div className="col-12">
                <button type="button" className="btn btn-secondary btn-sm me-2" onClick={() => setLoggingMode(false)}>Cancel</button>
                <button type="submit" className="btn btn-success btn-sm">💾 Save Entry</button>
              </div>
            </form>
          ) : (
            <div className="row gy-2 text-center">
              <div className="col-md-3">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">Calories</small>
                  <div className="fs-5">{todayLog.caloriesConsumed || 0}/{metrics.calorieTarget}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">🚶 Steps</small>
                  <div className="fs-5">{todayLog.steps || 0}/{profile.stepsGoal}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">🏃 Cardio</small>
                  <div className="fs-5">{todayLog.joggingCalories || 0} kcal</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light rounded">
                  <small className="text-muted">⚖️ Weight</small>
                  <div className="fs-5">{todayLog.weight ? todayLog.weight + ' kg' : 'Not logged'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Steps Progress - Enhanced */}
      <div className="col-xl-6">
        <div className="card p-4 shadow-sm">
          <h6 className="text-neon mb-3">🚶 Steps Progress</h6>
          <div className="text-center mb-3">
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(#10b981 0deg ${(Math.min(todayLog.steps || 0, profile.stepsGoal) / profile.stepsGoal) * 360}deg, #e5e7eb ${(Math.min(todayLog.steps || 0, profile.stepsGoal) / profile.stepsGoal) * 360}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#1f2937',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div className="fs-5 text-success">{todayLog.steps || 0}</div>
                <small className="text-muted">of {profile.stepsGoal}</small>
              </div>
            </div>
            <div className="mb-3">
              <div className="progress" style={{height: '10px'}}>
                <div className="progress-bar bg-success" style={{ width: `${Math.min(100, (todayLog.steps || 0) / profile.stepsGoal * 100)}%` }}></div>
              </div>
              <small className="text-muted mt-2 d-block">{Math.round((todayLog.steps || 0) / profile.stepsGoal * 100)}% of daily goal</small>
            </div>
          </div>
          <div className="p-3 bg-light rounded">
            <small className="text-muted">Remaining: <strong>{Math.max(0, profile.stepsGoal - (todayLog.steps || 0))} steps</strong></small>
          </div>
        </div>
      </div>

      {/* Calories Progress */}
      <div className="col-xl-6">
        <div className="card p-4 shadow-sm">
          <h6 className="text-neon mb-3">🔥 Calorie Progress</h6>
          <div className="text-center mb-3">
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(#0ea5e9 0deg ${Math.min((todayLog.caloriesConsumed || 0) / metrics.calorieTarget * 360, 360)}deg, #e5e7eb ${Math.min((todayLog.caloriesConsumed || 0) / metrics.calorieTarget * 360, 360)}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#1f2937',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div className="fs-5 text-info">{todayLog.caloriesConsumed || 0}</div>
                <small className="text-muted">of {metrics.calorieTarget}</small>
              </div>
            </div>
            <div className="mb-3">
              <div className="progress" style={{height: '10px'}}>
                <div className="progress-bar bg-info" style={{ width: `${Math.min(100, (todayLog.caloriesConsumed || 0) / metrics.calorieTarget * 100)}%` }}></div>
              </div>
              <small className="text-muted mt-2 d-block">{Math.round((todayLog.caloriesConsumed || 0) / metrics.calorieTarget * 100)}% of daily target</small>
            </div>
          </div>
          <div className="p-3 bg-light rounded">
            <small className="text-muted">
              {todayLog.caloriesConsumed ? 
                `Remaining: ${Math.max(0, metrics.calorieTarget - (todayLog.caloriesConsumed || 0))} kcal` 
                : 'No entries logged yet'}
            </small>
          </div>
        </div>
      </div>

      {/* Weight Statistics - Based on Actual Logged Data */}
      <div className="col-xl-12">
        <div className="card p-4 shadow-sm">
          <h6 className="text-neon mb-3">⚖️ Weight Statistics (Based on Logged Data)</h6>
          <div className="row gy-2">
            <div className="col-6">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Total Change (Start → Now)</small>
                <div className="fs-5" style={{ color: isWeightDown ? '#10b981' : '#ef4444' }}>
                  {isWeightDown ? '📉' : '📈'} {Math.abs(weightChange)} kg
                </div>
                <small className="text-muted">From {profile.startWeight || profile.weight} kg to {currentWeight} kg</small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Days Logged</small>
                <div className="fs-5" style={{ color: '#06b6d4' }}>{sortedLogs.filter(log => log.weight !== undefined && log.weight !== null).length} days</div>
                <small className="text-muted">Out of {sortedLogs.length} activity logs</small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">First Logged Weight</small>
                <div className="fs-5" style={{ color: '#0ea5e9' }}>
                  {sortedLogs.find(log => log.weight !== undefined && log.weight !== null)?.weight || 'N/A'} kg
                </div>
                <small className="text-muted">
                  {sortedLogs.find(log => log.weight !== undefined && log.weight !== null)?.date || 'No weight logs'}
                </small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Latest Logged Weight</small>
                <div className="fs-5" style={{ color: '#f97316' }}>
                  {[...sortedLogs].reverse().find(log => log.weight !== undefined && log.weight !== null)?.weight || currentWeight} kg
                </div>
                <small className="text-muted">
                  {[...sortedLogs].reverse().find(log => log.weight !== undefined && log.weight !== null)?.date || 'Today'}
                </small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Change Per Week</small>
                <div className="fs-5" style={{ color: '#a78bfa' }}>
                  {sortedLogs.length > 0
                    ? ((weightChange / Math.max(Math.ceil(sortedLogs.length / 7), 1)).toFixed(2))
                    : 'N/A'} kg/week
                </div>
                <small className="text-muted">Based on logging frequency</small>
              </div>
            </div>
            <div className="col-6">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Goal Progress</small>
                <div className="fs-5" style={{ color: profile.goal === 'fat_loss' ? '#10b981' : '#3b82f6' }}>
                  {profile.goal === 'fat_loss' ? '📉 Losing' : profile.goal === 'muscle_gain' ? '💪 Gaining' : '➡️ Stable'}
                </div>
                <small className="text-muted">{profile.goal.replace('_', ' ')}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fat Loss Projection */}
      {profile.goal === 'fat_loss' && (
        <div className="col-xl-12">
          <div className="card p-4 shadow-sm">
            <h6 className="text-neon mb-3">📊 Fat Loss Projection</h6>
            <div className="row gy-3">
              <div className="col-md-4">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Days to lose 1kg</small>
                  <div className="fs-4" style={{ color: '#0ea5e9' }}>{metrics.fatLoss.daysToLose1kg}</div>
                  <small className="text-muted">At current deficit</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Weekly Loss</small>
                  <div className="fs-4" style={{ color: '#06b6d4' }}>{metrics.fatLoss.weeklyLossKg} kg</div>
                  <small className="text-muted">~{(metrics.fatLoss.weeklyLossKg * 7700).toFixed(0)} kcal/day deficit</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 bg-dark-card rounded">
                  <small className="text-muted">Monthly Loss</small>
                  <div className="fs-4" style={{ color: '#0ea5e9' }}>{metrics.fatLoss.monthlyLossKg} kg</div>
                  <small className="text-muted">Sustainable pace</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="col-xl-12">
        <div className="card p-4 shadow-sm">
          <h6 className="text-neon mb-3">🔬 Your Metrics</h6>
          <div className="row gy-3">
            <div className="col-md-3">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">BMR</small>
                <div className="fs-5">{metrics.bmr} kcal</div>
                <small className="text-muted">Calories at rest</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">TDEE</small>
                <div className="fs-5">{metrics.tdee} kcal</div>
                <small className="text-muted">Daily maintenance</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Target</small>
                <div className="fs-5">{metrics.calorieTarget} kcal</div>
                <small className="text-muted">For your goal</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-dark-card rounded">
                <small className="text-muted">Deficit</small>
                <div className="fs-5">{metrics.tdee - metrics.calorieTarget} kcal</div>
                <small className="text-muted">Daily adjustment</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
