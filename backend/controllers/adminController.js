import User from '../models/User.js'
import Quote from '../models/Quote.js'

export const listUsers = async (req, res) => {
  try {
    // Exclude mock/demo users by filtering out known mock emails
    const mockEmails = [
      'admin@example.com',
      'sofia@example.com',
      'noah@example.com',
      'jessica@example.com',
      'marcus@example.com'
    ]
    const users = await User.find({ email: { $nin: mockEmails }, isAdmin: { $ne: true } })
      .select('name email age gender weight height activityLevel goal streakCount lastActiveDate createdAt')
      .lean()
    res.json({ users, total: users.length })
  } catch (error) {
    console.error('List users error:', error)
    res.status(500).json({ message: 'Could not list users', error: error.message })
  }
}

export const getAdminStats = async (req, res) => {
  try {
    const users = await User.find().lean()
    const activeUsers = users.filter((user) => user.lastActiveDate === new Date().toISOString().slice(0, 10)).length
    const averageStreak = users.length ? Math.round(users.reduce((sum, u) => sum + (u.streakCount || 0), 0) / users.length) : 0
    const usersWithLogs = users.filter((user) => user.logs?.length).length
    const totalLogs = users.reduce((sum, u) => sum + (u.logs?.length || 0), 0)

    res.json({
      totalUsers: users.length,
      activeUsers,
      averageStreak,
      usersWithLogs,
      totalLogs,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ message: 'Could not fetch stats', error: error.message })
  }
}

export const updateQuote = async (req, res) => {
  try {
    const { text } = req.body
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Quote text is required' })
    }
    if (text.length > 500) {
      return res.status(400).json({ message: 'Quote text must be 500 characters or less' })
    }

    await Quote.create({ text: text.trim() })
    res.json({ message: 'Motivational quote added successfully' })
  } catch (error) {
    console.error('Quote update error:', error)
    res.status(500).json({ message: 'Could not update quote', error: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id
    if (!userId) return res.status(400).json({ message: 'User ID is required' })
    
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin users' })
    }

    await User.findByIdAndDelete(userId)
    res.json({ message: 'User deleted successfully', userId })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ message: 'Could not delete user', error: error.message })
  }
}

export const resetUserStreak = async (req, res) => {
  try {
    const userId = req.params.id
    if (!userId) return res.status(400).json({ message: 'User ID is required' })
    
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    
    user.streakCount = 0
    await user.save()
    res.json({ message: 'User streak reset successfully', userId })
  } catch (error) {
    console.error('Reset streak error:', error)
    res.status(500).json({ message: 'Could not reset streak', error: error.message })
  }
}
