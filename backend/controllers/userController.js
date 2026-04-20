import User from '../models/User.js'
import Quote from '../models/Quote.js'
import { calculateBMR, calculateTDEE, calculateCalorieTarget, estimateFatLoss, calculateMacros, getGeneralDietSuggestions, generateGeneralMealIdeas } from '../utils/calculator.js'

export const getUserDashboard = async (req, res) => {
  try {
    let user = await User.findById(req.user.id).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Ensure startWeight is set (for users created before startWeight field was added)
    if (!user.startWeight) {
      // Update the user to have startWeight
      await User.findByIdAndUpdate(req.user.id, { startWeight: user.weight })
      user.startWeight = user.weight
    }

    const bmr = calculateBMR(user)
    const tdee = calculateTDEE({ bmr, activityLevel: user.activityLevel })
    const calorieTarget = calculateCalorieTarget({ tdee, goal: user.goal, deficit: user.deficit })
    const fatLoss = estimateFatLoss({ calorieTarget, tdee })
    const macros = calculateMacros({ calorieTarget, weight: user.weight, goal: user.goal })
    const quote = await Quote.findOne().sort({ updatedAt: -1 }).lean()

    const todayLog = user.logs.find((log) => log.date === new Date().toISOString().slice(0, 10)) || {}

    res.json({
      profile: user,
      metrics: { bmr, tdee, calorieTarget, fatLoss, macros },
      todayLog,
      quote: quote?.text || 'Keep pushing forward — consistency builds momentum! 💪'
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    res.status(500).json({ message: 'Could not load dashboard', error: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const { name, age, gender, weight, startWeight, height, activityLevel, goal, deficit, stepsGoal } = req.body
    
    // Validation
    if (!name || !age || !gender || !weight || !height || !activityLevel || !goal) {
      return res.status(400).json({ message: 'All profile fields are required' })
    }
    if (age < 13 || age > 120 || weight < 30 || weight > 500 || height < 100 || height > 250) {
      return res.status(400).json({ message: 'Invalid profile values' })
    }
    if (startWeight && (startWeight < 30 || startWeight > 500)) {
      return res.status(400).json({ message: 'Invalid start weight' })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    user.name = name.trim()
    user.age = parseInt(age)
    user.gender = gender
    user.weight = parseFloat(weight)
    // Only update startWeight if it is explicitly changed and valid
    if (
      typeof startWeight !== 'undefined' &&
      startWeight !== null &&
      parseFloat(startWeight) !== user.startWeight
    ) {
      user.startWeight = parseFloat(startWeight)
    }
    user.height = parseFloat(height)
    user.activityLevel = activityLevel
    user.goal = goal
    user.deficit = parseInt(deficit) || 400
    user.stepsGoal = stepsGoal ? parseInt(stepsGoal) : (activityLevel === 'active' ? 12000 : activityLevel === 'moderate' ? 10000 : 8000)
    
    await user.save()

    res.json({ message: 'Profile updated successfully', user: { id: user._id, name: user.name } })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Update failed', error: error.message })
  }
}

export const addDailyLog = async (req, res) => {
  try {
    const { date, caloriesConsumed, steps, joggingCalories, weight, notes } = req.body
    
    // Validation
    if (caloriesConsumed === undefined || caloriesConsumed === null) {
      return res.status(400).json({ message: 'Calories consumed is required' })
    }
    if (caloriesConsumed < 0 || caloriesConsumed > 10000) {
      return res.status(400).json({ message: 'Invalid calorie value' })
    }
    if ((steps !== undefined && steps < 0) || steps > 100000) {
      return res.status(400).json({ message: 'Invalid steps value' })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const formattedDate = date || new Date().toISOString().slice(0, 10)
    const existingLog = user.logs.find((log) => log.date === formattedDate)

    if (existingLog) {
      existingLog.caloriesConsumed = parseInt(caloriesConsumed)
      existingLog.steps = steps !== undefined ? parseInt(steps) : existingLog.steps
      existingLog.joggingCalories = joggingCalories !== undefined ? parseInt(joggingCalories) : existingLog.joggingCalories
      existingLog.weight = weight !== undefined ? parseFloat(weight) : existingLog.weight
      existingLog.notes = notes ? notes.trim() : existingLog.notes
    } else {
      user.logs.push({ 
        date: formattedDate, 
        caloriesConsumed: parseInt(caloriesConsumed), 
        steps: steps !== undefined ? parseInt(steps) : 0, 
        joggingCalories: joggingCalories !== undefined ? parseInt(joggingCalories) : 0, 
        weight: weight !== undefined ? parseFloat(weight) : undefined, 
        notes: notes ? notes.trim() : '' 
      })
    }
    
    // Update current weight if provided (NEVER update startWeight from daily logs)
    if (weight !== undefined && weight !== null) {
      user.weight = parseFloat(weight)
      // IMPORTANT: startWeight should ONLY be updated via updateUserProfile, never from daily logs
    }
    
    // Streak calculation
    const today = new Date()
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (lastActive && lastActive.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10)) {
      user.streakCount += 1
    } else if (lastActive && lastActive.toISOString().slice(0, 10) === today.toISOString().slice(0, 10)) {
      // same day, keep streak
    } else {
      user.streakCount = 1
    }

    user.lastActiveDate = today.toISOString().slice(0, 10)
    await user.save()

    res.json({ message: 'Daily log saved successfully', streakCount: user.streakCount })
  } catch (error) {
    console.error('Daily log error:', error)
    res.status(500).json({ message: 'Could not save daily log', error: error.message })
  }
}

export const getIndianDietPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean()
    if (!user) return res.status(404).json({ message: 'User not found' })

    const bmr = calculateBMR(user)
    const tdee = calculateTDEE({ bmr, activityLevel: user.activityLevel })
    const calorieTarget = calculateCalorieTarget({ tdee, goal: user.goal, deficit: user.deficit })
    const macros = calculateMacros({ calorieTarget, weight: user.weight, goal: user.goal })

    const dietSuggestions = getGeneralDietSuggestions({
      goal: user.goal,
      macros
    })

    const mealIdeas = generateGeneralMealIdeas({
      goal: user.goal,
      calorieTarget
    })

    res.json({
      userGoal: user.goal,
      calorieTarget,
      tdee,
      macros,
      dietSuggestions,
      mealIdeas,
      recommendations: {
        fat_loss: 'Eat high protein (1.8-2.2g/kg) to preserve muscle during calorie deficit. Include lots of vegetables for satiety.',
        maintenance: 'Balance all macros equally. Include variety to ensure complete micronutrient intake.',
        muscle_gain: 'Eat high protein (1.8-2.2g/kg) and adequate carbs for training energy. Combine nutrition with resistance training 3-4x/week.'
      }
    })
  } catch (error) {
    console.error('Diet plan error:', error)
    res.status(500).json({ message: 'Could not load diet plan', error: error.message })
  }
}
