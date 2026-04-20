import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true },
  caloriesConsumed: { type: Number, default: 0, min: 0, max: 10000 },
  steps: { type: Number, default: 0, min: 0, max: 100000 },
  joggingCalories: { type: Number, default: 0, min: 0, max: 5000 },
  weight: { type: Number, min: 30, max: 500 },
  notes: { type: String, trim: true, maxlength: 500 }
}, { _id: false })

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: { type: String, required: true },
  age: { 
    type: Number, 
    required: true,
    min: 13,
    max: 120
  },
  gender: { 
    type: String, 
    required: true, 
    enum: ['male', 'female'] 
  },
  weight: { 
    type: Number, 
    required: true,
    min: 30,
    max: 500
  },
  startWeight: { 
    type: Number, 
    required: true,
    min: 30,
    max: 500
  },
  height: { 
    type: Number, 
    required: true,
    min: 100,
    max: 250
  },
  activityLevel: { 
    type: String, 
    required: true, 
    enum: ['sedentary', 'light', 'moderate', 'active'] 
  },
  goal: { 
    type: String, 
    required: true, 
    enum: ['fat_loss', 'maintenance', 'muscle_gain'] 
  },
  deficit: { type: Number, default: 400, min: 0, max: 1000 },
  isAdmin: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  streakCount: { type: Number, default: 0, min: 0 },
  lastActiveDate: { type: String, default: '' },
  stepsGoal: { type: Number, default: 8000, min: 1000 },
  logs: [logSchema]
}, { timestamps: true })

export default mongoose.model('User', userSchema)
