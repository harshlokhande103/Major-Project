import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.resolve('uploads')))

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
    profileImage: { type: String, default: '' },
  },
  { timestamps: true }
)

// Ensure unique index at DB level
userSchema.index({ email: 1 }, { unique: true })

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

// Multer storage
const uploadsDir = path.resolve('uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '')
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})
const upload = multer({ storage })

// Upload avatar
app.post('/api/users/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }
    const relativePath = `/uploads/${req.file.filename}`
    const user = await User.findByIdAndUpdate(id, { profileImage: relativePath }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.status(200).json({ id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, profileImage: user.profileImage })
  } catch (err) {
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


