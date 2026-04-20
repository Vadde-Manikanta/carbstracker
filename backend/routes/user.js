import express from 'express'
import { getUserDashboard, updateUserProfile, addDailyLog, getIndianDietPlan } from '../controllers/userController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.get('/dashboard', getUserDashboard)
router.put('/profile', updateUserProfile)
router.post('/log', addDailyLog)
router.get('/diet-plan', getIndianDietPlan)

export default router
