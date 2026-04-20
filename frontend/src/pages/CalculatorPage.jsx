import { useMemo, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { calculateBMR, calculateTDEE, calculateCalorieTarget, estimateFatLoss, calculateMacros } from '../utils/calculator.js'
import '../styles/CalculatorPage.css'

ChartJS.register(ArcElement, Tooltip, Legend)

const CalculatorPage = () => {
  const [input, setInput] = useState({
    name: '', age: 25, gender: 'male', weight: 70, height: 175, activityLevel: 'moderate', goal: 'fat_loss', deficit: 400
  })

  const outputs = useMemo(() => {
    const bmr = calculateBMR(input)
    const tdee = calculateTDEE({ bmr, activityLevel: input.activityLevel })
    const calorieTarget = calculateCalorieTarget({ tdee, goal: input.goal, deficit: input.deficit })
    return {
      bmr,
      tdee,
      calorieTarget,
      maintenance: tdee,
      fatLoss: estimateFatLoss({ calorieTarget, tdee }),
      macros: calculateMacros({ calorieTarget, weight: input.weight, goal: input.goal })
    }
  }, [input])

  const getGoalInfo = () => {
    const adjustment = input.goal === 'fat_loss' ? input.deficit : input.goal === 'muscle_gain' ? 300 : 0
    const deficit = input.goal === 'fat_loss' ? input.deficit : 0
    const surplus = input.goal === 'muscle_gain' ? 300 : 0

    if (input.goal === 'fat_loss') {
      return {
        label: '⬇️ Fat Loss',
        color: 'bg-danger',
        description: 'Create a calorie deficit to lose fat while preserving muscle',
        weeklyLoss: Math.round((deficit * 7) / 7700),
        emoji: '🔥'
      }
    } else if (input.goal === 'muscle_gain') {
      return {
        label: '⬆️ Muscle Gain',
        color: 'bg-success',
        description: 'Create a calorie surplus to fuel muscle growth with resistance training',
        weeklyGain: Math.round((surplus * 7) / 3850),
        emoji: '💪'
      }
    } else {
      return {
        label: '➡️ Maintenance',
        color: 'bg-info',
        description: 'Maintain your current weight and body composition',
        weeklyChange: 0,
        emoji: '⚖️'
      }
    }
  }

  const goalInfo = getGoalInfo()

  const handleChange = (e) => {
    const { name, value } = e.target
    setInput((prev) => ({ ...prev, [name]: name === 'name' ? value : Number(value) || value }))
  }

  const mealExample = (target, goal) => {
    const leanProtein = Math.round(target * 0.25 / 4)
    const fruitVeg = Math.round(target * 0.1 / 4)
    const healthyFats = Math.round(target * 0.2 / 9)
    const carbs = Math.max(0, Math.round((target - leanProtein * 4 - fruitVeg * 4 - healthyFats * 9) / 4))

    const goalLabel = goal === 'fat_loss' ? 'fat-loss' : goal === 'muscle_gain' ? 'muscle gain' : 'maintenance'

    return [
      `Breakfast: Greek yogurt bowl with berries, oats, and almond butter (~${Math.round(leanProtein * 4 + fruitVeg * 4 + healthyFats * 9)} kcal).`,
      `Lunch: Grilled chicken with quinoa, mixed greens, avocado, and olive oil dressing (~${Math.round(leanProtein * 4 + carbs * 4 + healthyFats * 9)} kcal).`,
      `Snack: Cottage cheese with fruit or protein shake (~${Math.round(leanProtein * 4 + fruitVeg * 4)} kcal).`,
      `Dinner: Salmon, sweet potato, and steamed broccoli (~${Math.round(leanProtein * 4 + carbs * 4 + healthyFats * 9)} kcal).`,
      `Goal note: This ${goalLabel} plan is designed for ~${target} kcal daily with balanced macros to support your fitness goals.`
    ]
  }

  const dietPlan = mealExample(outputs.calorieTarget, input.goal)
  const macroPieData = {
    labels: ['Protein', 'Fat', 'Carbs'],
    datasets: [{
      data: [outputs.macros.proteinCalories, outputs.macros.fatCalories, outputs.macros.carbCalories],
      backgroundColor: ['#38bdf8', '#f97316', '#34d399'],
      hoverOffset: 6
    }]
  }

  return (
    <div className="row gy-4">
      <div className="col-xl-5">
        <div className="card p-4 shadow-sm">
          <h3 className="text-neon">⚙️ Calorie Calculator</h3>
          <p className="small-text">Enter your details to calculate science-based maintenance calories and personalized daily intake for your goal.</p>
          <div className="row gy-3">
            <div className="col-12">
              <label className="form-label">Name</label>
              <input name="name" value={input.name} onChange={handleChange} className="form-control" placeholder="Your name" />
            </div>
            <div className="col-6">
              <label className="form-label">Weight (kg)</label>
              <input name="weight" value={input.weight} onChange={handleChange} type="number" className="form-control" min="30" />
            </div>
            <div className="col-6">
              <label className="form-label">Height (cm)</label>
              <input name="height" value={input.height} onChange={handleChange} type="number" className="form-control" min="120" />
            </div>
            <div className="col-6">
              <label className="form-label">Age</label>
              <input name="age" value={input.age} onChange={handleChange} type="number" className="form-control" min="12" />
            </div>
            <div className="col-6">
              <label className="form-label">Gender</label>
              <select name="gender" value={input.gender} onChange={handleChange} className="form-select">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Activity Level</label>
              <select name="activityLevel" value={input.activityLevel} onChange={handleChange} className="form-select">
                <option value="sedentary">Sedentary (desk job)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Your Goal</label>
              <select name="goal" value={input.goal} onChange={handleChange} className="form-select">
                <option value="fat_loss">🔥 Fat Loss</option>
                <option value="maintenance">⚖️ Maintenance</option>
                <option value="muscle_gain">💪 Muscle Gain</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Daily Adjustment ({input.goal === 'fat_loss' ? 'Deficit' : input.goal === 'muscle_gain' ? 'Surplus' : 'None'}) (kcal)</label>
              <input name="deficit" value={input.deficit} onChange={handleChange} type="number" className="form-control" min="200" max="700" />
              <div className="small-text mt-1">
                {input.goal === 'fat_loss' && '💡 Recommended: 400-500 kcal deficit for sustainable fat loss (~0.5 kg/week)'}
                {input.goal === 'muscle_gain' && '💡 Recommended: 300-400 kcal surplus for muscle growth (~0.5 kg/week)'}
                {input.goal === 'maintenance' && '💡 Maintain your weight and current body composition'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-xl-7">
        <div className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 className="text-neon">📊 Your Results</h3>
              <p className="small-text mb-0">Updates in real-time as you adjust your parameters above.</p>
            </div>
            <span className={`badge ${goalInfo.color}`}>{goalInfo.emoji} {goalInfo.label}</span>
          </div>

          <div className="row gy-3">
            <div className="col-sm-4">
              <div className="p-3 bg-dark-card rounded text-center border border-secondary">
                <small className="text-muted">BMR</small>
                <h3 className="text-warning">{outputs.bmr}</h3>
                <p className="small-text">Burned at rest</p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-3 bg-dark-card rounded text-center border border-primary">
                <small className="text-muted">Maintenance</small>
                <h3 className="text-info">{outputs.maintenance}</h3>
                <p className="small-text">To maintain weight</p>
              </div>
            </div>
            <div className="col-sm-4">
              <div className="p-3 bg-dark-card rounded text-center border border-success" style={{borderColor: input.goal === 'fat_loss' ? '#dc3545' : input.goal === 'muscle_gain' ? '#28a745' : '#17a2b8'}}>
                <small className="text-muted">Daily Target</small>
                <h3 className={input.goal === 'fat_loss' ? 'text-danger' : input.goal === 'muscle_gain' ? 'text-success' : 'text-info'}>{outputs.calorieTarget}</h3>
                <p className="small-text">For your {input.goal === 'fat_loss' ? 'fat loss' : input.goal === 'muscle_gain' ? 'muscle gain' : 'maintenance'}</p>
              </div>
            </div>
          </div>

          <div className={`mt-3 p-3 rounded ${goalInfo.color} bg-opacity-10`} style={{borderLeft: '4px solid currentColor'}}>
            <h6 className="text-neon mb-2">{goalInfo.emoji} {goalInfo.label}</h6>
            <p className="small-text mb-1">{goalInfo.description}</p>
            {input.goal === 'fat_loss' && <p className="small-text text-success mb-0">Expected weekly fat loss: ~{goalInfo.weeklyLoss} kg at {input.deficit} kcal/day deficit</p>}
            {input.goal === 'muscle_gain' && <p className="small-text text-success mb-0">Expected weekly muscle gain: ~{goalInfo.weeklyGain} kg with proper training and nutrition</p>}
            {input.goal === 'maintenance' && <p className="small-text text-info mb-0">Eat at maintenance to keep your weight stable</p>}
          </div>

          <div className="row gy-3 mt-4">
            <div className="col-md-6">
              <div className="p-3 bg-dark-card rounded">
                <h6 className="text-neon">💊 Macro Split</h6>
                <Doughnut data={macroPieData} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-dark-card rounded">
                <h6 className="text-neon">📋 Macro Targets</h6>
                <ul className="list-unstyled mb-0">
                  <li className="py-2 border-bottom">
                    <span className="text-info">Protein:</span> <strong>{outputs.macros.proteinGrams}g</strong>
                    <small className="text-muted d-block">({outputs.macros.proteinCalories} kcal, {Math.round(outputs.macros.proteinCalories / outputs.calorieTarget * 100)}%)</small>
                  </li>
                  <li className="py-2 border-bottom">
                    <span className="text-warning">Fat:</span> <strong>{outputs.macros.fatGrams}g</strong>
                    <small className="text-muted d-block">({outputs.macros.fatCalories} kcal, {Math.round(outputs.macros.fatCalories / outputs.calorieTarget * 100)}%)</small>
                  </li>
                  <li className="py-2">
                    <span className="text-success">Carbs:</span> <strong>{outputs.macros.carbGrams}g</strong>
                    <small className="text-muted d-block">({outputs.macros.carbCalories} kcal, {Math.round(outputs.macros.carbCalories / outputs.calorieTarget * 100)}%)</small>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-dark-card rounded border border-secondary">
            <h5 className="text-neon mb-3">🍽️ Sample Daily Meal Plan</h5>
            <p className="small-text text-muted mb-3">A balanced meal structure supporting your {input.deficit ? input.deficit + ' kcal' : 'maintenance'} daily target.</p>
            <ol className="mb-0" style={{ paddingLeft: '1rem' }}>
              {dietPlan.map((item, i) => <li key={i} className="mb-2 small-text">{item}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalculatorPage
