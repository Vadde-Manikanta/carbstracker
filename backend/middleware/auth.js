import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/User.js'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' })
  }

  try {
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) return res.status(401).json({ message: 'User not found' })

    req.user = { 
      id: user._id, 
      role: user.isAdmin ? 'admin' : 'user', 
      email: user.email,
      name: user.name
    }
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
    res.status(401).json({ message: 'Token invalid or expired', error: error.message })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export default protect
