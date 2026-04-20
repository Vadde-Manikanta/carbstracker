/**
 * ==========================================
 * CARBS TRACKER - FITNESS CALCULATOR
 * ==========================================
 * 
 * Scientific References:
 * 
 * 1. BMR FORMULA: Mifflin-St Jeor (1990)
 *    Reference: https://www.ncbi.nlm.nih.gov/pubmed/3350756
 *    Accuracy: ±10-15% (Best for modern populations)
 *    Used by: USDA, NIH, CDC, Harvard Medical School
 *    
 *    Formula:
 *    Men:   BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 *    Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 * 
 * 2. TDEE FORMULA: Activity Multiplier Method
 *    Reference: WHO Technical Report 844 (2000)
 *    Reference: FAO/WHO/UNU Energy Requirements Guidelines
 *    
 *    Activity Levels:
 *    - Sedentary (BMR × 1.2): Little or no exercise, desk job
 *    - Light (BMR × 1.375): 1-3 days/week light exercise
 *    - Moderate (BMR × 1.55): 3-5 days/week moderate exercise
 *    - Active (BMR × 1.725): 6-7 days/week or physical job
 * 
 * 3. CALORIE DEFICIT/SURPLUS
 *    Reference: Journal of the Academy of Nutrition and Dietetics (2016)
 *    Reference: International Society of Sports Nutrition
 *    
 *    Healthy Fat Loss: 300-700 kcal/day deficit
 *    - Results in 0.3-0.5 kg/week weight loss
 *    - Sustainable and preserves muscle mass
 *    - Prevents metabolic adaptation
 *    
 *    Healthy Muscle Gain: 300-500 kcal/day surplus  
 *    - Results in 0.3-0.5 kg/week weight gain (mostly muscle with training)
 *    - Combined with resistance training
 *    - Optimal protein intake critical
 * 
 * 4. MACRO DISTRIBUTION
 *    Reference: Position Stand of Academy of Nutrition and Dietetics
 *    Reference: International Society of Sports Nutrition
 *    
 *    Protein:
 *    - Fat Loss: 1.8-2.2g/kg (preserves muscle during calorie deficit)
 *    - Maintenance: 1.6-1.8g/kg (standard recommendation)
 *    - Muscle Gain: 1.8-2.2g/kg (supports muscle protein synthesis)
 *    
 *    Fat:
 *    - 20-30% of total calories (essential for hormones and nutrients)
 *    - Minimum 0.5g/kg body weight
 *    - Maximum 35% to maintain carb intake for performance
 *    
 *    Carbs:
 *    - Remaining calories after protein and fat
 *    - Goal: 3-12g/kg depending on activity level
 *    - Supports training performance and recovery
 * 
 * 5. 1 KG BODY WEIGHT CONVERSIONS
 *    Body Fat: 7700 kcal = 1 kg (0.9 kg fat + 0.1 kg water/glycogen)
 *    Muscle: 3850 kcal = 0.5 kg muscle (requires training)
 *    
 *    This means: To lose 1 kg fat in 7 days = 1100 kcal/day deficit
 *    To gain 0.5 kg muscle in 14 days = 275 kcal/day surplus
 * 
 * ==========================================
 */

export const activityMultiplier = {
  sedentary: 1.2,      // Little or no exercise, desk job
  light: 1.375,        // 1-3 days/week light exercise (30 min)
  moderate: 1.55,      // 3-5 days/week moderate exercise (30-45 min)
  active: 1.725        // 6-7 days/week heavy exercise or physical job
}

export const proteinRange = {
  fat_loss: { min: 1.8, max: 2.2 },      // High protein to preserve muscle
  maintenance: { min: 1.6, max: 1.8 },   // Standard recommendation
  muscle_gain: { min: 1.8, max: 2.2 }    // Support muscle synthesis
}

export const fatPercentage = { min: 0.22, max: 0.30 }  // 22-30% of calories

/**
 * Calculate Basal Metabolic Rate (BMR)
 * Using Mifflin-St Jeor Formula (Most Accurate)
 * 
 * @param {number} weight - Body weight in kg
 * @param {number} height - Height in cm  
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} BMR in kcal/day
 * 
 * Interpretation:
 * - This is the amount of calories you burn at complete rest
 * - Represents ~70% of daily energy expenditure for sedentary people
 * - Used as base to calculate TDEE
 */
export const calculateBMR = ({ weight, height, age, gender }) => {
  if (!weight || !height || !age || !gender) return 0
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'male' ? Math.round(base + 5) : Math.round(base - 161)
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * Using activity multiplier method
 * 
 * @param {number} bmr - Basal metabolic rate
 * @param {string} activityLevel - 'sedentary', 'light', 'moderate', or 'active'
 * @returns {number} TDEE in kcal/day
 * 
 * Interpretation:
 * - This is the total calories you burn in a day
 * - Multiply BMR by activity multiplier
 * - Foundation for goal-based calorie targets
 */
export const calculateTDEE = ({ bmr, activityLevel }) => {
  if (!bmr || !activityLevel) return 0
  return Math.round(bmr * (activityMultiplier[activityLevel] || 1.2))
}

/**
 * Calculate Goal-Based Calorie Target
 * 
 * Formula Logic:
 * - Fat Loss: TDEE - deficit (300-700 kcal/day)
 *   → Results in 0.3-0.5 kg/week loss
 *   → Sustainable with proper training
 * 
 * - Maintenance: TDEE (no change)
 *   → Stay at current weight
 *   → Recomposition possible with training
 * 
 * - Muscle Gain: TDEE + surplus (400 kcal/day)
 *   → Results in 0.3-0.5 kg/week gain (with training)
 *   → Mostly muscle with proper nutrition
 * 
 * @param {number} tdee - Total daily energy expenditure
 * @param {string} goal - 'fat_loss', 'maintenance', or 'muscle_gain'
 * @param {number} deficit - Custom deficit in kcal (for fat loss goal)
 * @returns {number} Daily calorie target in kcal
 */
export const calculateCalorieTarget = ({ tdee, goal, deficit }) => {
  if (!tdee || !goal) return 0
  
  if (goal === 'fat_loss') {
    // Safe deficit between 300-700 kcal/day
    const safeDeficit = Math.min(700, Math.max(300, deficit || 400))
    // Minimum 1200 kcal for women, prevents metabolic damage
    return Math.max(1200, Math.round(tdee - safeDeficit))
  }
  
  if (goal === 'muscle_gain') {
    // Add 400 kcal for muscle gain (0.3-0.5kg/week with proper training)
    const surplusCalories = 400
    return Math.round(tdee + surplusCalories)
  }
  
  // Maintenance goal - no adjustment
  return Math.round(tdee)
}

/**
 * Estimate Fat Loss Rate
 * Using 7700 kcal = 1 kg body fat
 * 
 * @param {number} calorieTarget - Daily calorie target
 * @param {number} tdee - Total daily expenditure
 * @returns {object} Fat loss projections (days, weeks, months)
 */
export const estimateFatLoss = ({ calorieTarget, tdee }) => {
  const deficit = tdee - calorieTarget
  if (deficit <= 0) return { 
    daysToLose1kg: 0, 
    weeklyLossKg: 0, 
    monthlyLossKg: 0,
    calorieDeficit: 0
  }
  
  // 7700 kcal = 1 kg body fat
  const daysToLose1kg = Math.max(1, Math.round(7700 / deficit))
  return {
    daysToLose1kg,
    weeklyLossKg: parseFloat(((deficit * 7) / 7700).toFixed(2)),
    monthlyLossKg: parseFloat(((deficit * 30) / 7700).toFixed(2)),
    calorieDeficit: deficit
  }
}

/**
 * Estimate Muscle Gain Rate
 * Using 3850 kcal = 0.5 kg muscle (requires training + protein)
 * Note: Only ~50% of surplus becomes muscle, rest is fat
 * 
 * @param {number} calorieTarget - Daily calorie target
 * @param {number} tdee - Total daily expenditure
 * @returns {object} Muscle gain projections
 */
export const estimateMuscleGain = ({ calorieTarget, tdee }) => {
  const surplus = calorieTarget - tdee
  if (surplus <= 0) return { 
    daysToGain1kg: 0, 
    weeklyGainKg: 0, 
    monthlyGainKg: 0,
    calorieDeficit: 0
  }
  
  // 3850 kcal per 0.5kg muscle (requires resistance training + high protein)
  const muscleCaloriesPerHalfKg = 3850
  const daysToGain1kg = Math.max(1, Math.round((muscleCaloriesPerHalfKg * 2) / surplus))
  return {
    daysToGain1kg,
    weeklyGainKg: parseFloat(((surplus * 7) / muscleCaloriesPerHalfKg).toFixed(2)),
    monthlyGainKg: parseFloat(((surplus * 30) / muscleCaloriesPerHalfKg).toFixed(2)),
    calorieDeficit: surplus,
    note: 'Requires resistance training 3-4x/week and adequate protein'
  }
}



export const calculateMacros = ({ calorieTarget, weight, goal }) => {
  if (!calorieTarget || !weight || !goal) return { proteinGrams: 0, fatGrams: 0, carbGrams: 0 }

  // Scientific macro breakdown based on goal
  const proteinMin = proteinRange[goal].min
  const proteinGram = Math.round(weight * proteinMin)
  const proteinCalories = proteinGram * 4

  // Fat: 20-30% of calories (essential for hormone health)
  const fatCalories = Math.round(calorieTarget * 0.25)
  const fatGram = Math.round(fatCalories / 9)

  // Carbs: Remaining calories
  const carbCalories = Math.max(0, calorieTarget - proteinCalories - fatCalories)
  const carbGram = Math.round(carbCalories / 4)

  return {
    proteinGrams: proteinGram,
    fatGrams: fatGram,
    carbGrams: carbGram,
    proteinCalories,
    fatCalories,
    carbCalories
  }
}

/**
 * INDIAN DIET RECOMMENDATIONS
 * Based on traditional Indian cuisine with modern nutrition science
 * Tailored for different fitness goals
 * 
 * Categories:
 * - Proteins: Lentils, beans, paneer, yogurt, fish, chicken
 * - Carbs: Rice, roti, oats, whole grains, vegetables
 * - Fats: Coconut, sesame oil, nuts, ghee, olive oil
 */

export const indianDietFoods = {
  proteins: {
    vegetarian: [
      { name: 'Moong Dal (Yellow Lentil)', kcal: 105, protein: 7, serving: '½ cup cooked' },
      { name: 'Chana Dal', kcal: 120, protein: 8, serving: '½ cup cooked' },
      { name: 'Rajma (Kidney Beans)', kcal: 110, protein: 8, serving: '½ cup cooked' },
      { name: 'Paneer', kcal: 265, protein: 28, serving: '100g' },
      { name: 'Greek Yogurt', kcal: 130, protein: 12, serving: '150ml' },
      { name: 'Chickpeas', kcal: 140, protein: 10, serving: '½ cup cooked' },
      { name: 'Tofu', kcal: 76, protein: 8, serving: '100g' }
    ],
    nonVegetarian: [
      { name: 'Chicken Breast (Tandoori)', kcal: 165, protein: 31, serving: '100g' },
      { name: 'Fish (Grilled)', kcal: 145, protein: 25, serving: '100g' },
      { name: 'Egg (Boiled)', kcal: 78, protein: 6, serving: '1 large' },
      { name: 'Shrimp Curry', kcal: 120, protein: 20, serving: '100g' },
      { name: 'Mutton', kcal: 294, protein: 25, serving: '100g' }
    ]
  },
  carbs: {
    whole: [
      { name: 'Brown Rice', kcal: 111, carbs: 23, serving: '½ cup cooked' },
      { name: 'Whole Wheat Roti', kcal: 104, carbs: 20, serving: '1 roti' },
      { name: 'Oatmeal', kcal: 150, carbs: 27, serving: '½ cup dry' },
      { name: 'Bajra (Millet)', kcal: 120, carbs: 22, serving: '½ cup cooked' },
      { name: 'Jowar', kcal: 110, carbs: 21, serving: '½ cup cooked' },
      { name: 'Quinoa', kcal: 120, carbs: 21, serving: '½ cup cooked' }
    ],
    simple: [
      { name: 'White Rice', kcal: 130, carbs: 28, serving: '½ cup cooked' },
      { name: 'Maida Roti', kcal: 95, carbs: 18, serving: '1 roti' },
      { name: 'Banana', kcal: 105, carbs: 27, serving: '1 medium' },
      { name: 'Sweet Potato', kcal: 103, carbs: 24, serving: '100g cooked' }
    ]
  },
  fats: [
    { name: 'Coconut Oil', kcal: 120, fat: 14, serving: '1 tbsp' },
    { name: 'Ghee', kcal: 135, fat: 15, serving: '1 tbsp' },
    { name: 'Mustard Oil', kcal: 120, fat: 14, serving: '1 tbsp' },
    { name: 'Sesame Oil', kcal: 120, fat: 14, serving: '1 tbsp' },
    { name: 'Almonds', kcal: 164, fat: 14, serving: '10 almonds' },
    { name: 'Peanuts', kcal: 160, fat: 14, serving: '1 handful' },
    { name: 'Cashews', kcal: 157, fat: 12, serving: '10 cashews' }
  ],
  vegetables: [
    { name: 'Broccoli', kcal: 34, protein: 3, serving: '100g' },
    { name: 'Spinach', kcal: 23, protein: 3, serving: '100g cooked' },
    { name: 'Bell Pepper', kcal: 31, carbs: 7, serving: '1 cup' },
    { name: 'Tomato', kcal: 18, carbs: 4, serving: '1 medium' },
    { name: 'Onion', kcal: 40, carbs: 9, serving: '100g' },
    { name: 'Cucumber', kcal: 16, carbs: 4, serving: '1 cup' },
    { name: 'Bitter Gourd', kcal: 34, protein: 2, serving: '100g' }
  ]
}

/**
 * Generate Indian diet suggestions based on macro goals
 */
export const getIndianDietSuggestions = ({ goal, macros, isVegetarian = true }) => {
  const suggestions = []
  
  // Protein suggestions
  const proteinFoods = isVegetarian 
    ? indianDietFoods.proteins.vegetarian 
    : [...indianDietFoods.proteins.vegetarian, ...indianDietFoods.proteins.nonVegetarian]
  
  suggestions.push({
    category: '🥛 PROTEIN SOURCES',
    description: `Daily target: ${macros.proteinGrams}g`,
    foods: proteinFoods,
    samples: goal === 'muscle_gain' 
      ? ['Paneer Bhurji with whole wheat roti', 'Masoor Dal with vegetables', 'Tandoori Chicken']
      : goal === 'fat_loss'
      ? ['Grilled Fish Curry', 'Chickpea Salad', 'Boiled Eggs']
      : ['Dahi with granola', 'Chana Masala', 'Paneer Tikka']
  })
  
  // Carb suggestions
  const carbFoods = goal === 'muscle_gain' || goal === 'maintenance'
    ? indianDietFoods.carbs.whole
    : indianDietFoods.carbs.whole.concat(indianDietFoods.carbs.simple.slice(0, 2))
  
  suggestions.push({
    category: '🌾 CARBOHYDRATE SOURCES',
    description: `Daily target: ${macros.carbGrams}g`,
    foods: carbFoods,
    samples: ['Brown Rice', 'Whole Wheat Roti', 'Oatmeal with banana', 'Vegetable Khichdi']
  })
  
  // Fat suggestions
  suggestions.push({
    category: '🫒 HEALTHY FAT SOURCES',
    description: `Daily target: ${macros.fatGrams}g`,
    foods: indianDietFoods.fats,
    samples: ['Coconut oil for cooking', 'Almonds as snack', 'Ghee in moderation', 'Peanut butter']
  })
  
  // Vegetable suggestions
  suggestions.push({
    category: '🥬 VEGETABLES (Low Cal, High Nutrients)',
    description: 'Eat freely with every meal',
    foods: indianDietFoods.vegetables,
    samples: ['Spinach Curry', 'Mixed Vegetable Sabzi', 'Salad with every meal']
  })
  
  return suggestions
}

/**
 * Generate meal plan ideas based on Indian cuisine
 */
export const generateIndianMealIdeas = ({ goal, calorieTarget, isVegetarian = true }) => {
  const mealPlans = {
    fat_loss: {
      breakfast: [
        '🥚 2 Boiled eggs + 1 whole wheat roti + veggies',
        '🥣 Oatmeal (½ cup) with milk + berries',
        '🥛 Greek yogurt (150ml) + granola (30g)'
      ],
      lunch: [
        '🍚 Brown rice (1 cup) + Grilled chicken/Fish (100g) + mixed vegetables',
        '🍛 Dal (1 cup) + Roti (2) + Salad',
        '🥗 Chickpea salad with lemon and vegetables'
      ],
      dinner: [
        '🍲 Lentil soup + Grilled paneer + Vegetables',
        '🥘 Vegetable curry (oil reduced) + Brown rice',
        '🐟 Grilled fish + Roti + Salad'
      ],
      snacks: [
        '🥜 Handful of almonds',
        '🍌 1 banana',
        '🥒 Cucumber slices',
        '🍅 Boiled chickpeas (½ cup)'
      ]
    },
    maintenance: {
      breakfast: [
        '🥣 Oatmeal (½ cup) + milk + nuts',
        '🥚 Masala scrambled eggs (2) + Roti (1)',
        '🥛 Dahi (1 cup) + Granola + Honey'
      ],
      lunch: [
        '🍚 Rice (1.5 cups) + Paneer curry (100g) + Roti (1)',
        '🍛 Dal + Rice + Ghee (1 tsp) + Vegetables',
        '🥘 Chicken curry with brown rice'
      ],
      dinner: [
        '🍲 Dal (1 cup) + Roti (2) + Vegetables',
        '🥘 Mixed vegetable curry + Rice',
        '🐟 Fish curry with rice + Salad'
      ],
      snacks: [
        '🥜 Peanuts (handful)',
        '🍌 Banana with peanut butter',
        '🥛 Milk with turmeric',
        '🥒 Sprout salad'
      ]
    },
    muscle_gain: {
      breakfast: [
        '🥣 Oatmeal (1 cup) + Milk + Banana + Almonds',
        '🥚 4 Eggs + Roti (2) + Oil',
        '🥛 Protein shake with milk + 2 Roti'
      ],
      lunch: [
        '🍚 Rice (2 cups) + Chicken curry (150g) + Roti (2)',
        '🍛 Dal (1.5 cup) + Rice (1.5 cup) + Ghee + Vegetables',
        '🥘 Paneer curry (150g) + Brown rice (1.5 cup) + Roti (1)'
      ],
      dinner: [
        '🍲 Dal (1.5 cup) + Roti (2) + Ghee + Vegetables',
        '🐟 Fish curry (150g) + Rice (1.5 cup)',
        '🥘 Mixed lentils with ghee + Roti (2)'
      ],
      snacks: [
        '🥤 Protein shake',
        '🥜 Peanut butter sandwich',
        '🥛 Milk with almonds',
        '🍌 Banana with cashews'
      ]
    }
  }
  
  return mealPlans[goal] || mealPlans.maintenance
}

/**
 * GENERAL DIET PLAN (Non-India-Specific)
 * Science-based macronutrient recommendations for different goals
 */
export const generalDietFoods = {
  proteins: [
    { name: 'Chicken Breast (Grilled)', kcal: 165, protein: 31, serving: '100g' },
    { name: 'Turkey Breast', kcal: 135, protein: 29, serving: '100g' },
    { name: 'Salmon (Baked)', kcal: 206, protein: 22, serving: '100g' },
    { name: 'Egg (Boiled)', kcal: 78, protein: 6, serving: '1 large' },
    { name: 'Greek Yogurt', kcal: 130, protein: 12, serving: '150ml' },
    { name: 'Cottage Cheese', kcal: 110, protein: 14, serving: '½ cup' },
    { name: 'Tofu (Firm)', kcal: 76, protein: 8, serving: '100g' },
    { name: 'Lentils (Cooked)', kcal: 115, protein: 9, serving: '½ cup' },
    { name: 'Chickpeas', kcal: 140, protein: 10, serving: '½ cup' },
    { name: 'Black Beans', kcal: 114, protein: 8, serving: '½ cup' },
    { name: 'Beef Lean', kcal: 180, protein: 26, serving: '100g' },
    { name: 'Tuna (Canned)', kcal: 99, protein: 22, serving: '100g' }
  ],
  carbs: [
    { name: 'Oatmeal', kcal: 150, carbs: 27, serving: '½ cup dry' },
    { name: 'Brown Rice', kcal: 111, carbs: 23, serving: '½ cup cooked' },
    { name: 'White Rice', kcal: 130, carbs: 28, serving: '½ cup cooked' },
    { name: 'Whole Wheat Bread', kcal: 80, carbs: 14, serving: '1 slice' },
    { name: 'Sweet Potato', kcal: 103, carbs: 24, serving: '100g' },
    { name: 'Quinoa', kcal: 120, carbs: 21, serving: '½ cup cooked' },
    { name: 'Banana', kcal: 105, carbs: 27, serving: '1 medium' },
    { name: 'Apple', kcal: 95, carbs: 25, serving: '1 medium' },
    { name: 'Whole Wheat Pasta', kcal: 87, carbs: 17, serving: '½ cup cooked' },
    { name: 'Potato (Boiled)', kcal: 77, carbs: 17, serving: '100g' },
    { name: 'Berries (Mixed)', kcal: 50, carbs: 12, serving: '1 cup' }
  ],
  fats: [
    { name: 'Olive Oil', kcal: 120, fat: 14, serving: '1 tbsp' },
    { name: 'Almond Butter', kcal: 96, fat: 9, serving: '1 tbsp' },
    { name: 'Avocado', kcal: 160, fat: 15, serving: '½ medium' },
    { name: 'Almonds', kcal: 164, fat: 14, serving: '10 almonds' },
    { name: 'Walnuts', kcal: 185, fat: 18, serving: '14 halves' },
    { name: 'Chia Seeds', kcal: 138, fat: 9, serving: '1 tbsp' },
    { name: 'Salmon', kcal: 206, fat: 13, serving: '100g' },
    { name: 'Dark Chocolate', kcal: 170, fat: 12, serving: '30g' },
    { name: 'Coconut Oil', kcal: 120, fat: 14, serving: '1 tbsp' }
  ],
  vegetables: [
    { name: 'Broccoli', kcal: 34, protein: 3, serving: '100g' },
    { name: 'Spinach', kcal: 23, protein: 3, serving: '100g cooked' },
    { name: 'Kale', kcal: 49, protein: 4, serving: '100g' },
    { name: 'Bell Pepper', kcal: 31, carbs: 7, serving: '1 cup' },
    { name: 'Carrots', kcal: 41, carbs: 10, serving: '100g' },
    { name: 'Tomato', kcal: 18, carbs: 4, serving: '1 medium' },
    { name: 'Cucumber', kcal: 16, carbs: 4, serving: '1 cup' },
    { name: 'Zucchini', kcal: 21, carbs: 4, serving: '100g' },
    { name: 'Brussels Sprouts', kcal: 43, protein: 3, serving: '100g' },
    { name: 'Green Beans', kcal: 31, carbs: 7, serving: '100g' }
  ]
}

/**
 * Generate general diet suggestions based on macro goals
 */
export const getGeneralDietSuggestions = ({ goal, macros }) => {
  const suggestions = []
  
  suggestions.push({
    category: '🥩 PROTEIN SOURCES',
    description: `Daily target: ${macros.proteinGrams}g | Sources: Lean meat, fish, eggs, dairy, legumes`,
    foods: generalDietFoods.proteins,
    samples: goal === 'muscle_gain' 
      ? ['Grilled chicken breast', 'Salmon with rice', 'Beef with vegetables', 'Protein smoothie']
      : goal === 'fat_loss'
      ? ['Skinless chicken', 'White fish', 'Egg whites', 'Greek yogurt', 'Tofu']
      : ['Turkey breast', 'Salmon', 'Eggs', 'Cottage cheese']
  })
  
  suggestions.push({
    category: '🌾 CARBOHYDRATES',
    description: `Daily target: ${macros.carbGrams}g | Focus on whole grains for sustained energy`,
    foods: generalDietFoods.carbs,
    samples: goal === 'muscle_gain' || goal === 'maintenance'
      ? ['Brown rice', 'Oatmeal', 'Sweet potato', 'Quinoa', 'Whole wheat bread']
      : ['Brown rice', 'Oatmeal', 'Sweet potato', 'Berries', 'Whole wheat bread']
  })
  
  suggestions.push({
    category: '🫒 HEALTHY FATS',
    description: `Daily target: ${macros.fatGrams}g | Essential for hormones and nutrient absorption`,
    foods: generalDietFoods.fats,
    samples: ['Olive oil', 'Avocado', 'Almonds', 'Salmon', 'Dark chocolate']
  })
  
  suggestions.push({
    category: '🥬 VEGETABLES & FIBER',
    description: 'Eat freely with every meal | Low calorie, high micronutrients',
    foods: generalDietFoods.vegetables,
    samples: ['Broccoli', 'Spinach', 'Bell peppers', 'Carrots', 'Salad with every meal']
  })
  
  return suggestions
}

/**
 * Generate general meal plan ideas
 */
export const generateGeneralMealIdeas = ({ goal, calorieTarget }) => {
  const mealPlans = {
    fat_loss: {
      breakfast: [
        '🍳 Egg white omelet (2 eggs) with vegetables + whole wheat toast',
        '🥣 Oatmeal (½ cup) with berries and almond milk',
        '🥛 Greek yogurt (150ml) with granola (1 tbsp) and berries'
      ],
      lunch: [
        '🍗 Grilled chicken breast (150g) with brown rice (¾ cup) and broccoli',
        '🐟 Baked white fish (150g) with sweet potato and salad',
        '🥗 Large mixed salad with grilled chicken, olive oil dressing'
      ],
      dinner: [
        '🍗 Turkey breast (150g) with whole wheat pasta and marinara sauce',
        '🐟 Salmon (120g) with quinoa and roasted vegetables',
        '🥘 Lean beef stir-fry with lots of vegetables and brown rice'
      ],
      snacks: [
        '🥜 Almonds (15 pieces)',
        '🍌 Banana (1 medium)',
        '🧀 Cottage cheese (½ cup)',
        '🍎 Apple with peanut butter (1 tbsp)'
      ]
    },
    maintenance: {
      breakfast: [
        '🍳 Scrambled eggs (2) with whole grain toast and butter',
        '🥣 Oatmeal with milk, banana and almonds',
        '🥛 Protein smoothie with fruit and yogurt'
      ],
      lunch: [
        '🍗 Chicken (150g) with rice (1 cup) and vegetables',
        '🐟 Salmon (150g) with sweet potato and salad',
        '🥘 Ground turkey with pasta and vegetables'
      ],
      dinner: [
        '🍗 Chicken with brown rice and broccoli',
        '🐟 Fish with potato and asparagus',
        '🥘 Lean beef with vegetables and rice'
      ],
      snacks: [
        '🥜 Mixed nuts (handful)',
        '🍌 Banana with peanut butter',
        '🧀 String cheese',
        '🍎 Fruit with yogurt'
      ]
    },
    muscle_gain: {
      breakfast: [
        '🍳 3-4 eggs with toast and butter, orange juice',
        '🥣 Oatmeal (1 cup) with whole milk, banana, almonds',
        '🥤 Protein shake: milk, oats, banana, peanut butter'
      ],
      lunch: [
        '🍗 Chicken (200g) with rice (1.5 cup) and vegetables',
        '🐟 Salmon (150g) with sweet potato (200g) and rice',
        '🥘 Beef (150g) with brown rice (1.5 cup) and vegetables'
      ],
      dinner: [
        '🍗 Chicken (150g) with pasta (1.5 cup) and olive oil',
        '🐟 Fish (150g) with rice (1.5 cup) and vegetables',
        '🥘 Ground turkey (150g) with rice and vegetables'
      ],
      snacks: [
        '🥤 Protein shake',
        '🍌 Banana with peanut butter',
        '🥜 Almonds and raisins',
        '🧀 Cottage cheese with honey'
      ]
    }
  }
  
  return mealPlans[goal] || mealPlans.maintenance
}

