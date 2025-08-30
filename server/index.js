import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/claritycall'

// Mongoose connection
mongoose.set('strictQuery', true)
mongoose
  .connect(mongoUri)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('MongoDB connected')
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })

// Schema & Model
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

// Ensure unique index at DB level


const User = mongoose.model('User', userSchema)

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Basic duplicate check
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // NOTE: In production, hash the password with bcrypt
    const user = await User.create({ firstName, lastName, email, password })
    return res.status(201).json({ id: user._id, email: user.email })
  } catch (err) {
    // Duplicate key error (unique index violation)
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // NOTE: In production compare hashed passwords
    const isMatch = user.password === password
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    return res.status(200).json({ id: user._id, email: user.email, firstName: user.firstName })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`)
})


