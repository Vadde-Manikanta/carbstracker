import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carbs_tracker'

const connectDB = async () => {
  try {
    // Set mongoose options for better error handling
    const conn = await mongoose.connect(MONGO_URI, {
      retryWrites: true,
      w: 'majority'
    })
    
    console.log('✓ MongoDB connected')
    return conn
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    console.error('   Make sure MongoDB is running and the MONGO_URI is correct')
    process.exit(1)
  }
}

export default connectDB
