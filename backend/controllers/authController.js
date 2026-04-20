import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' })

// Validation utilities
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validatePassword = (password) => password && password.length >= 6

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, weight, height, activityLevel, goal, deficit, stepsGoal } = req.body

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    if (!age || !gender || !weight || !height || !activityLevel || !goal) {
      return res.status(400).json({ message: 'All profile fields are required' })
    }
    if (age < 13 || age > 120 || weight < 30 || weight > 500 || height < 100 || height > 250) {
      return res.status(400).json({ message: 'Invalid profile values' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })

    if (email === 'admin@example.com') {
      return res.status(403).json({ message: 'Admin account cannot be created through registration.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const defaultStepsGoal = activityLevel === 'active' ? 12000 : activityLevel === 'moderate' ? 10000 : 8000
    
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      age: parseInt(age),
      gender,
      weight: parseFloat(weight),
      startWeight: parseFloat(weight),
      height: parseFloat(height),
      activityLevel,
      goal,
      deficit: deficit || 400,
      stepsGoal: stepsGoal || defaultStepsGoal
    })

    res.status(201).json({ 
      token: createToken(user._id), 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.isAdmin ? 'admin' : 'user' 
      } 
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Registration failed', error: error.message })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      console.log('User not found:', email.toLowerCase())
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      console.log('Password mismatch for user:', email.toLowerCase())
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    console.log('Login successful for:', email.toLowerCase(), 'isAdmin:', user.isAdmin)
    res.json({ 
      token: createToken(user._id), 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.isAdmin ? 'admin' : 'user' 
      } 
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Login failed', error: error.message })
  }
}
