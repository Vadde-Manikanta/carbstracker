import express from 'express'
import { getAdminStats, updateQuote, listUsers, deleteUser, resetUserStreak } from '../controllers/adminController.js'
import protect, { adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)
router.use(adminOnly)
router.get('/users', listUsers)
router.get('/stats', getAdminStats)
router.put('/quote', updateQuote)
router.delete('/users/:id', deleteUser)
router.put('/users/:id/reset-streak', resetUserStreak)

export default router
