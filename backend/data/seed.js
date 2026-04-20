import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import connectDB from '../config/db.js'
import User from '../models/User.js'
import Quote from '../models/Quote.js'

dotenv.config()

const seed = async () => {
  try {
    await connectDB()
    
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Quote.deleteMany({})

    console.log('🔐 Creating users with hashed passwords...')
    const password = await bcrypt.hash('password123', 10)
    
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10)
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password,
        age: 30,
        gender: 'female',
        weight: 65,
        startWeight: 65,
        height: 170,
        activityLevel: 'moderate',
        goal: 'maintenance',
        deficit: 400,
        isAdmin: true,
        stepsGoal: 10000,
        streakCount: 12,
        lastActiveDate: today,
        logs: [
          { 
            date: today, 
            caloriesConsumed: 2100, 
            steps: 10500, 
            joggingCalories: 300, 
            weight: 65,
            notes: 'Great day!'
          },
          { 
            date: yesterday, 
            caloriesConsumed: 2050, 
            steps: 9800, 
            joggingCalories: 280, 
            weight: 65.1,
            notes: 'Good progress'
          }
        ]
      },
      {
        name: 'Sofia Reed',
        email: 'sofia@example.com',
        password,
        age: 29,
        gender: 'female',
        weight: 68,
        startWeight: 68,
        height: 167,
        activityLevel: 'moderate',
        goal: 'fat_loss',
        deficit: 500,
        stepsGoal: 10000,
        streakCount: 8,
        lastActiveDate: today,
        logs: [
          { 
            date: today, 
            caloriesConsumed: 1650, 
            steps: 9800, 
            joggingCalories: 320, 
            weight: 68,
            notes: 'On track with fat loss!'
          },
          { 
            date: yesterday, 
            caloriesConsumed: 1700, 
            steps: 9200, 
            joggingCalories: 300, 
            weight: 68.2,
            notes: 'Great workout'
          }
        ]
      },
      {
        name: 'Noah Hayes',
        email: 'noah@example.com',
        password,
        age: 32,
        gender: 'male',
        weight: 82,
        startWeight: 82,
        height: 180,
        activityLevel: 'active',
        goal: 'muscle_gain',
        deficit: 400,
        stepsGoal: 12000,
        streakCount: 15,
        lastActiveDate: today,
        logs: [
          { 
            date: today, 
            caloriesConsumed: 2950, 
            steps: 11700, 
            joggingCalories: 420, 
            weight: 82,
            notes: 'Bulk progress'
          },
          { 
            date: yesterday, 
            caloriesConsumed: 2900, 
            steps: 12100, 
            joggingCalories: 400, 
            weight: 81.8,
            notes: 'Morning run'
          }
        ]
      },
      {
        name: 'Jessica Price',
        email: 'jessica@example.com',
        password,
        age: 26,
        gender: 'female',
        weight: 62,
        startWeight: 62,
        height: 165,
        activityLevel: 'light',
        goal: 'fat_loss',
        deficit: 400,
        stepsGoal: 8000,
        streakCount: 5,
        lastActiveDate: today,
        logs: [
          { 
            date: today, 
            caloriesConsumed: 1550, 
            steps: 8200, 
            joggingCalories: 250, 
            weight: 62,
            notes: 'Consistent tracking'
          }
        ]
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@example.com',
        password,
        age: 35,
        gender: 'male',
        weight: 90,
        startWeight: 90,
        height: 185,
        activityLevel: 'active',
        goal: 'fat_loss',
        deficit: 600,
        stepsGoal: 12000,
        streakCount: 20,
        lastActiveDate: today,
        logs: [
          { 
            date: today, 
            caloriesConsumed: 2300, 
            steps: 12500, 
            joggingCalories: 500, 
            weight: 90,
            notes: 'Aggressive fat loss'
          },
          { 
            date: yesterday, 
            caloriesConsumed: 2350, 
            steps: 13000, 
            joggingCalories: 480, 
            weight: 90.2,
            notes: 'Running strong'
          }
        ]
      }
    ]

    await User.create(users)
    console.log('✓ Users created successfully')

    // Create multiple quotes for rotation
    const quotes = [
      { text: 'Consistency trumps motivation — build one healthy habit every day.', author: 'Carbs Tracker' },
      { text: 'Your body is not a problem to be solved. It\'s a sacred form to be honored.', author: 'Anonymous' },
      { text: 'The only person you should try to be better than is the person you were yesterday.', author: 'James Clear' },
      { text: 'Success is the product of daily habits. What you do every day matters more than what you do once in a while.', author: 'James Clear' },
      { text: 'Progress is not about perfection. It\'s about consistency.', author: 'Carbs Tracker' },
      { text: 'A healthy outside starts from the inside.', author: 'Robert Urich' },
      { text: 'The greatest wealth is health.', author: 'Virgil' },
      { text: 'Fitness is not about being better than someone else. It\'s about being better than you used to be.', author: 'Khloe Kardashian' },
      { text: 'Take care of your body. It\'s the only place you have to live.', author: 'Jim Rohn' },
      { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' }
    ]

    await Quote.insertMany(quotes)
    console.log('✓ Quotes created successfully')

    console.log('\n✅ Seed completed successfully!')
    console.log('\n📝 Test Accounts:')
    console.log('   Admin:    admin@example.com / password123')
    console.log('   Sofia:    sofia@example.com / password123 (Fat Loss)')
    console.log('   Noah:     noah@example.com / password123 (Muscle Gain)')
    console.log('   Jessica:  jessica@example.com / password123 (Fat Loss)')
    console.log('   Marcus:   marcus@example.com / password123 (Aggressive Fat Loss)')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seed()
