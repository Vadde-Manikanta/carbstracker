import { useEffect, useState } from 'react'
import { getIndianDietPlan } from '../services/auth.js'
import '../styles/DietPage.css'

const DietPage = () => {
  const [dietPlan, setDietPlan] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDietPlan = async () => {
      try {
        setLoading(true)
        const data = await getIndianDietPlan()
        setDietPlan(data)
        setError('')
      } catch (err) {
        setError(err.message || 'Failed to load diet plan')
      } finally {
        setLoading(false)
      }
    }
    loadDietPlan()
  }, [])

  if (loading) return <div className="text-center py-5">⏳ Loading your personalized meal plan...</div>
  if (error) return <div className="alert alert-danger">⚠️ {error}</div>
  if (!dietPlan) return <div className="text-center py-5">No meal plan available</div>

  const getGoalEmoji = () => {
    if (dietPlan.userGoal === 'fat_loss') return '🔥'
    if (dietPlan.userGoal === 'muscle_gain') return '💪'
    return '⚖️'
  }

  const getGoalLabel = () => {
    if (dietPlan.userGoal === 'fat_loss') return 'Fat Loss'
    if (dietPlan.userGoal === 'muscle_gain') return 'Muscle Gain'
    return 'Maintenance'
  }

  return (
    <div className="py-4">
      <h1 className="text-neon mb-4">{getGoalEmoji()} Personalized Meal Plan - {getGoalLabel()}</h1>

      {/* Summary Cards */}
      <div className="row gy-3 mb-4">
        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <small className="text-muted">Daily Calorie Target</small>
            <h2 className="text-info">{dietPlan.calorieTarget}</h2>
            <small>kcal/day</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <small className="text-muted">Maintenance Calories</small>
            <h2 className="text-warning">{dietPlan.tdee}</h2>
            <small>kcal/day</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <small className="text-muted">Protein Target</small>
            <h2 className="text-primary">{dietPlan.macros.proteinGrams}g</h2>
            <small>({dietPlan.macros.proteinCalories} kcal)</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card p-3 text-center shadow-sm">
            <small className="text-muted">Steps Goal</small>
            <h2 className="text-success">8,000+</h2>
            <small>steps/day</small>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="alert alert-info mb-4" style={{borderLeft: '4px solid #17a2b8'}}>
        <h5 className="mb-2">{getGoalEmoji()} Your {getGoalLabel()} Plan</h5>
        <p className="mb-0">{dietPlan.recommendations[dietPlan.userGoal]}</p>
      </div>

      {/* Macronutrient Breakdown */}
      <div className="row gy-3 mb-4">
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-neon mb-3">💊 Protein</h6>
            <div className="text-center mb-3">
              <h3 className="text-primary">{dietPlan.macros.proteinGrams}g</h3>
              <small className="text-muted">{dietPlan.macros.proteinCalories} kcal ({Math.round(dietPlan.macros.proteinCalories / dietPlan.calorieTarget * 100)}%)</small>
            </div>
            <div className="progress">
              <div className="progress-bar bg-primary" style={{width: `${Math.round(dietPlan.macros.proteinCalories / dietPlan.calorieTarget * 100)}%`}}></div>
            </div>
            <small className="text-muted mt-2 d-block">Essential for muscle repair and growth</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-neon mb-3">🫒 Fat</h6>
            <div className="text-center mb-3">
              <h3 className="text-warning">{dietPlan.macros.fatGrams}g</h3>
              <small className="text-muted">{dietPlan.macros.fatCalories} kcal ({Math.round(dietPlan.macros.fatCalories / dietPlan.calorieTarget * 100)}%)</small>
            </div>
            <div className="progress">
              <div className="progress-bar bg-warning" style={{width: `${Math.round(dietPlan.macros.fatCalories / dietPlan.calorieTarget * 100)}%`}}></div>
            </div>
            <small className="text-muted mt-2 d-block">Critical for hormone production</small>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="text-neon mb-3">🌾 Carbs</h6>
            <div className="text-center mb-3">
              <h3 className="text-success">{dietPlan.macros.carbGrams}g</h3>
              <small className="text-muted">{dietPlan.macros.carbCalories} kcal ({Math.round(dietPlan.macros.carbCalories / dietPlan.calorieTarget * 100)}%)</small>
            </div>
            <div className="progress">
              <div className="progress-bar bg-success" style={{width: `${Math.round(dietPlan.macros.carbCalories / dietPlan.calorieTarget * 100)}%`}}></div>
            </div>
            <small className="text-muted mt-2 d-block">Energy for workouts and daily activity</small>
          </div>
        </div>
      </div>

      {/* Food Categories */}
      <h3 className="text-neon mb-3">🍽️ Food Suggestions by Category</h3>
      <div className="row gy-4 mb-4">
        {dietPlan.dietSuggestions.map((category, idx) => (
          <div key={idx} className="col-lg-6">
            <div className="card p-4 shadow-sm">
              <h5 className="text-neon mb-3">{category.category}</h5>
              <p className="small-text mb-3 text-muted">{category.description}</p>

              {/* Food list */}
              <div className="mb-3">
                <h6 className="mb-2">Available Options:</h6>
                <div className="list-group">
                  {category.foods.slice(0, 6).map((food, i) => (
                    <div key={i} className="list-group-item bg-light-card border-0 mb-2 p-2">
                      <div className="d-flex justify-content-between">
                        <strong>{food.name}</strong>
                        <span className="badge bg-primary">{food.serving}</span>
                      </div>
                      <small className="text-muted">
                        {food.kcal && `${food.kcal} kcal`}
                        {food.protein && ` | Protein: ${food.protein}g`}
                        {food.carbs && ` | Carbs: ${food.carbs}g`}
                        {food.fat && ` | Fat: ${food.fat}g`}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample meals */}
              {category.samples && (
                <div>
                  <h6 className="mb-2">💡 Quick Examples:</h6>
                  <ul className="list-unstyled">
                    {category.samples.map((meal, i) => (
                      <li key={i} className="mb-2 small-text">
                        ✓ {meal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sample Daily Meal Plan */}
      <h3 className="text-neon mb-3">📋 Sample Daily Meal Schedule</h3>
      <div className="row gy-4">
        {/* Breakfast */}
        <div className="col-md-6 col-lg-3">
          <div className="card p-4 shadow-sm">
            <h5 className="text-neon mb-3">🌅 Breakfast</h5>
            <ul className="list-group list-group-flush">
              {dietPlan.mealIdeas.breakfast.map((meal, i) => (
                <li key={i} className="list-group-item bg-light-card border-0 mb-2 p-2 small-text">
                  {meal}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lunch */}
        <div className="col-md-6 col-lg-3">
          <div className="card p-4 shadow-sm">
            <h5 className="text-neon mb-3">☀️ Lunch</h5>
            <ul className="list-group list-group-flush">
              {dietPlan.mealIdeas.lunch.map((meal, i) => (
                <li key={i} className="list-group-item bg-light-card border-0 mb-2 p-2 small-text">
                  {meal}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dinner */}
        <div className="col-md-6 col-lg-3">
          <div className="card p-4 shadow-sm">
            <h5 className="text-neon mb-3">🌙 Dinner</h5>
            <ul className="list-group list-group-flush">
              {dietPlan.mealIdeas.dinner.map((meal, i) => (
                <li key={i} className="list-group-item bg-light-card border-0 mb-2 p-2 small-text">
                  {meal}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Snacks */}
        <div className="col-md-6 col-lg-3">
          <div className="card p-4 shadow-sm">
            <h5 className="text-neon mb-3">🥜 Snacks</h5>
            <ul className="list-group list-group-flush">
              {dietPlan.mealIdeas.snacks.map((meal, i) => (
                <li key={i} className="list-group-item bg-light-card border-0 mb-2 p-2 small-text">
                  {meal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-4 p-4 bg-dark-card rounded border border-secondary">
        <h5 className="text-neon mb-3">💡 Pro Tips for Success</h5>
        <ul className="list-unstyled">
          <li className="mb-2">
            <strong>✓ Track Everything:</strong> Use a food scale and app to log calories and macros accurately.
          </li>
          <li className="mb-2">
            <strong>✓ Meal Prep:</strong> Prepare meals in advance to stay consistent with your plan.
          </li>
          <li className="mb-2">
            <strong>✓ Hydration:</strong> Drink 2-3 liters of water daily for optimal health and performance.
          </li>
          <li className="mb-2">
            <strong>✓ Flexibility:</strong> These are guidelines. Adjust as needed based on hunger and energy levels.
          </li>
          <li className="mb-2">
            <strong>✓ Consistency:</strong> Follow your plan for at least 4 weeks before assessing results.
          </li>
          <li className="mb-2">
            <strong>✓ Adjust & Refine:</strong> If progress stalls after 4 weeks, adjust calories by ±100-200.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default DietPage
