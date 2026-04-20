import mongoose from 'mongoose'

const quoteSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  author: { 
    type: String, 
    default: 'Carbs Tracker',
    trim: true
  },
  updatedAt: { type: Date, default: Date.now, index: true }
})

export default mongoose.model('Quote', quoteSchema)
