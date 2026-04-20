/**
 * DIAGNOSTIC SCRIPT FOR CARBS TRACKER
 * 
 * This script will:
 * 1. Test MongoDB connection
 * 2. Check if admin user exists and password is correct
 * 3. Verify database state
 * 4. Test JWT token creation
 * 5. Report any issues with detailed solutions
 */

import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import connectDB from './config/db.js'
import User from './models/User.js'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const ADMIN_EMAIL = 'admin@example.com'
const TEST_PASSWORD = 'password123'

console.log('🔍 CARBS TRACKER DIAGNOSTIC SCRIPT')
console.log('=' .repeat(50))

const runDiagnostics = async () => {
  try {
    // 1. Test MongoDB connection
    console.log('\n1️⃣  Testing MongoDB Connection...')
    await connectDB()
    console.log('✅ MongoDB connected successfully')

    // 2. Check if admin user exists
    console.log('\n2️⃣  Checking Admin User...')
    const adminUser = await User.findOne({ email: ADMIN_EMAIL })
    
    if (!adminUser) {
      console.log('❌ Admin user not found! Run: npm run seed')
      console.log('   This will create admin@example.com with password: password123')
      return
    }
    
    console.log('✅ Admin user found:', adminUser.email)
    console.log('   - Name:', adminUser.name)
    console.log('   - isAdmin:', adminUser.isAdmin)

    // 3. Test password verification
    console.log('\n3️⃣  Testing Password Verification...')
    const passwordMatch = await bcrypt.compare(TEST_PASSWORD, adminUser.password)
    
    if (passwordMatch) {
      console.log('✅ Password verification works! "password123" is correct')
    } else {
      console.log('❌ Password mismatch! The hashed password does not match "password123"')
      console.log('   This could mean:')
      console.log('   - Admin account was created with a different password')
      console.log('   - Database was corrupted or migrated incorrectly')
      console.log('   Solution: Run: npm run seed (this will recreate the admin user)')
      return
    }

    // 4. Test JWT token creation
    console.log('\n4️⃣  Testing JWT Token Creation...')
    try {
      const token = jwt.sign({ id: adminUser._id }, JWT_SECRET, { expiresIn: '7d' })
      console.log('✅ JWT token created successfully')
      console.log('   Token (first 50 chars):', token.substring(0, 50) + '...')
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ JWT token verified. User ID:', decoded.id)
    } catch (error) {
      console.log('❌ JWT error:', error.message)
    }

    // 5. Check total users in database
    console.log('\n5️⃣  Database Statistics...')
    const totalUsers = await User.countDocuments()
    console.log('   Total users:', totalUsers)
    
    const allUsers = await User.find({}, 'email name isAdmin')
    console.log('   Users in database:')
    allUsers.forEach((user) => {
      console.log(`   - ${user.email} (${user.name}) ${user.isAdmin ? '[ADMIN]' : '[USER]'}`)
    })

    // 6. Final recommendation
    console.log('\n' + '='.repeat(50))
    console.log('✅ DIAGNOSIS COMPLETE')
    console.log('\n📝 NEXT STEPS:')
    console.log('1. If admin user not found: Run: npm run seed')
    console.log('2. If password failed: Run: npm run seed')
    console.log('3. Test login with:')
    console.log('   Email: admin@example.com')
    console.log('   Password: password123')
    console.log('4. Check your .env file has:')
    console.log('   - MONGO_URI=mongodb://localhost:27017/carbs')
    console.log('   - JWT_SECRET=your_secret')
    console.log('   - PORT=5000')

  } catch (error) {
    console.error('❌ DIAGNOSTIC ERROR:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure MongoDB is running')
    console.log('2. Check .env file has MONGO_URI set correctly')
    console.log('3. Verify MongoDB connection string is valid')
    console.log('4. Try: mongosh or mongo to test MongoDB connection')
  } finally {
    process.exit(0)
  }
}

runDiagnostics()
