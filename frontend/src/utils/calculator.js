export const activityMultiplier = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725
}

export const proteinRange = {
  fat_loss: { min: 1.8, max: 2.2 },
  maintenance: { min: 1.6, max: 1.8 },
  muscle_gain: { min: 1.8, max: 2.0 }
}

export const fatPercent = 0.25

export const calculateBMR = ({ weight, height, age, gender }) => {
  if (!weight || !height || !age || !gender) return 0
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? Math.round(base + 5) : Math.round(base - 161)
}

export const calculateTDEE = ({ bmr, activityLevel }) => {
  if (!bmr || !activityLevel) return 0
  return Math.round(bmr * (activityMultiplier[activityLevel] || 1.2))
}

export const calculateCalorieTarget = ({ tdee, goal, deficit }) => {
  if (!tdee || !goal) return 0
  if (goal === 'fat_loss') return Math.max(1200, Math.round(tdee - (deficit || 400)))
  if (goal === 'muscle_gain') return Math.round(tdee + 300)
  return Math.round(tdee)
}

export const estimateFatLoss = ({ calorieTarget, tdee }) => {
  const deficit = tdee - calorieTarget
  if (deficit <= 0) return { daysToLose1kg: 0, weeklyLossKg: 0, monthlyLossKg: 0 }
  return {
    daysToLose1kg: Math.max(1, Math.round(7700 / deficit)),
    weeklyLossKg: parseFloat(((deficit * 7) / 7700).toFixed(2)),
    monthlyLossKg: parseFloat(((deficit * 30) / 7700).toFixed(2))
  }
}

export const calculateMacros = ({ calorieTarget, weight, goal }) => {
  if (!calorieTarget || !weight) return { proteinGrams: 0, fatGrams: 0, carbGrams: 0 }
  const proteinGrams = Math.round(weight * proteinRange[goal].min)
  const proteinCalories = proteinGrams * 4
  const fatCalories = Math.round(calorieTarget * fatPercent)
  const fatGrams = Math.round(fatCalories / 9)
  const carbsCalories = Math.max(0, calorieTarget - proteinCalories - fatCalories)
  return { proteinGrams, fatGrams, carbGrams: Math.round(carbsCalories / 4), proteinCalories, fatCalories, carbCalories: carbsCalories }
}
