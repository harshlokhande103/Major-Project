import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcryptjs'
import helmet from 'helmet'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

dotenv.config()

const app = express()
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
// Keep permissive CORS for dev (vite proxy). Tighten in prod as needed.
app.use(cors())

// Sessions (used for server-side admin auth)
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_insecure_secret_change_me'
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  })
)
app.use('/uploads', express.static(path.resolve('uploads')))

const mongoUri = 'mongodb://localhost:27017/Clarity_Call'

// Mongoose connection
mongoose.set('strictQuery', true)
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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
    bio: { type: String, default: '' },
    title: { type: String, default: '' },
    expertise: { type: [String], default: [] },
    isBlocked: { type: Boolean, default: false },
    lastActiveAt: { type: Date },
  },
  { timestamps: true }
)

// Ensure unique index at DB level


const User = mongoose.model('User', userSchema)

// Simple role helpers for session-based auth
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) return next()
  return res.status(401).json({ message: 'Unauthorized' })
}

const requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') return next()
  return res.status(403).json({ message: 'Forbidden' })
}

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

// Routes
app.post('/api/register', authLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password, bio, title, expertise } = req.body
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Basic duplicate check
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ firstName, lastName, email, password: hashedPassword, bio, title, expertise })
    return res.status(201).json(user)
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

app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Admin login via env credentials (never hardcode)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''

    const isAdminEmail = ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    if (isAdminEmail) {
      let adminOk = false
      if (ADMIN_PASSWORD_HASH) {
        adminOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      } else if (ADMIN_PASSWORD) {
        adminOk = password === ADMIN_PASSWORD
      }
      if (!adminOk) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }
      // Set admin session
      req.session.user = { role: 'admin', email: ADMIN_EMAIL }
      return res.status(200).json({ role: 'admin', email: ADMIN_EMAIL, redirect: '/admin/dashboard' })
    }

    // Normal user auth
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Set user session
    req.session.user = { role: 'user', id: String(user._id), email: user.email }
    return res.status(200).json({ ...user.toObject(), role: 'user' })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

app.put('/api/profile', requireAuth, async (req, res) => {
  const { _id, fullName, professionalTitle, bio, expertise } = req.body;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Split fullName into firstName and lastName
    const nameParts = fullName.split(' ');
    user.firstName = nameParts[0];
    user.lastName = nameParts.slice(1).join(' ');

    user.title = professionalTitle;
    user.bio = bio;
    user.expertise = expertise;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Admin-only routes (session-based)
app.get('/admin/dashboard', requireAdmin, (req, res) => {
  return res.status(200).json({ message: 'Welcome to Admin Dashboard' })
})

app.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const { q } = req.query
    const filter = q
      ? {
          $or: [
            { firstName: new RegExp(q, 'i') },
            { lastName: new RegExp(q, 'i') },
            { email: new RegExp(q, 'i') },
          ],
        }
      : {}
    const users = await User.find(filter).select('-password')
    return res.status(200).json(users)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

app.patch('/admin/users/:id/block', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { block } = req.body
    const user = await User.findByIdAndUpdate(id, { isBlocked: !!block }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.status(200).json(user)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// --- Mock data stores (replace with real models later) ---
const mockMentorRequests = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', bio: 'Experienced React developer', title: 'Senior Developer', expertise: ['React', 'Node.js'], status: 'pending' },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', bio: 'UI/UX expert with 5 years experience', title: 'Design Lead', expertise: ['UI/UX', 'Figma'], status: 'pending' },
  { id: '3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@example.com', bio: 'Full-stack developer', title: 'Tech Lead', expertise: ['JavaScript', 'Python'], status: 'approved' }
]
const mockSessions = {
  upcoming: [
    { id: '1', title: 'React Mentoring Session', time: '2024-01-15 10:00 AM', mentor: 'John Doe', mentee: 'Alice Brown' },
    { id: '2', title: 'UI/UX Review', time: '2024-01-16 2:00 PM', mentor: 'Jane Smith', mentee: 'Bob Wilson' }
  ],
  completed: [
    { id: '3', title: 'JavaScript Basics', time: '2024-01-10 3:00 PM', mentor: 'Mike Johnson', mentee: 'Charlie Davis' }
  ],
  cancelled: [
    { id: '4', title: 'Python Workshop', time: '2024-01-12 11:00 AM', mentor: 'Sarah Wilson', mentee: 'David Lee' }
  ],
}
const mockPayments = [
  { id: '1', userEmail: 'alice@example.com', amount: 50, status: 'paid', date: '2024-01-10' },
  { id: '2', userEmail: 'bob@example.com', amount: 75, status: 'paid', date: '2024-01-11' }
]
const mockSubscriptions = [
  { id: '1', userEmail: 'charlie@example.com', plan: 'Premium', status: 'active' },
  { id: '2', userEmail: 'david@example.com', plan: 'Basic', status: 'active' }
]
const mockFeedbacks = [
  { id: '1', userEmail: 'alice@example.com', mentorEmail: 'john@example.com', rating: 5, comment: 'Great session!' },
  { id: '2', userEmail: 'bob@example.com', mentorEmail: 'jane@example.com', rating: 4, comment: 'Very helpful' }
]
const mockLogs = [
  { type: 'mentor_request_approved', id: '1', at: Date.now() - 3600000, by: 'admin@gmail.com' },
  { type: 'user_blocked', id: 'user123', at: Date.now() - 7200000, by: 'admin@gmail.com' }
]

// Mentor Applications
app.get('/admin/mentor-requests', requireAdmin, (req, res) => {
  return res.status(200).json(mockMentorRequests)
})

app.post('/admin/mentor-requests/:id/approve', requireAdmin, (req, res) => {
  const { id } = req.params
  const item = mockMentorRequests.find((r) => r.id === id)
  if (!item) return res.status(404).json({ message: 'Request not found' })
  item.status = 'approved'
  mockLogs.push({ type: 'mentor_request_approved', id, at: Date.now(), by: req.session.user?.email })
  return res.status(200).json(item)
})

app.post('/admin/mentor-requests/:id/reject', requireAdmin, (req, res) => {
  const { id } = req.params
  const item = mockMentorRequests.find((r) => r.id === id)
  if (!item) return res.status(404).json({ message: 'Request not found' })
  item.status = 'rejected'
  mockLogs.push({ type: 'mentor_request_rejected', id, at: Date.now(), by: req.session.user?.email })
  return res.status(200).json(item)
})

// Sessions
app.get('/admin/sessions', requireAdmin, (req, res) => {
  return res.status(200).json(mockSessions)
})

// Payments & Subscriptions
app.get('/admin/payments', requireAdmin, (req, res) => {
  return res.status(200).json({ payments: mockPayments, subscriptions: mockSubscriptions })
})

// Feedback & Ratings
app.get('/admin/feedbacks', requireAdmin, (req, res) => {
  return res.status(200).json(mockFeedbacks)
})
app.delete('/admin/feedbacks/:id', requireAdmin, (req, res) => {
  const { id } = req.params
  const idx = mockFeedbacks.findIndex((f) => f.id === id)
  if (idx === -1) return res.status(404).json({ message: 'Feedback not found' })
  const removed = mockFeedbacks.splice(idx, 1)
  mockLogs.push({ type: 'feedback_removed', id, at: Date.now(), by: req.session.user?.email })
  return res.status(200).json({ removed })
})

// Analytics
app.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const blockedUsers = await User.countDocuments({ isBlocked: true })
    return res.status(200).json({
      users: { total: totalUsers, blocked: blockedUsers },
      bookings: { total: mockSessions.upcoming.length + mockSessions.completed.length },
      popularMentors: [],
      topRatedMentors: [],
      categoriesDemand: [],
      newUsers: { daily: 0, weekly: 0, monthly: 0 },
      revenue: { daily: 0, weekly: 0, monthly: 0 },
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Reports & Logs
app.get('/admin/logs', requireAdmin, (req, res) => {
  return res.status(200).json(mockLogs)
})

// Optional: JWT-based alternatives (no UI changes required)
// Issue a JWT token
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'dev_insecure_jwt_secret_change_me'

app.post('/api/login-jwt', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
    const isAdminEmail = ADMIN_EMAIL && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()

    if (isAdminEmail) {
      let adminOk = false
      if (ADMIN_PASSWORD_HASH) adminOk = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      else if (ADMIN_PASSWORD) adminOk = password === ADMIN_PASSWORD
      if (!adminOk) return res.status(401).json({ message: 'Invalid credentials' })
      const token = jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '8h' })
      return res.status(200).json({ token, role: 'admin', redirect: '/admin/dashboard' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ role: 'user', id: String(user._id), email: user.email }, JWT_SECRET, { expiresIn: '8h' })
    return res.status(200).json({ token, role: 'user' })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

const verifyJWT = (roles = []) => {
  return (req, res, next) => {
    try {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (!token) return res.status(401).json({ message: 'Unauthorized' })
      const payload = jwt.verify(token, JWT_SECRET)
      if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ message: 'Forbidden' })
      req.jwt = payload
      return next()
    } catch (e) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
  }
}

app.get('/admin-jwt/dashboard', verifyJWT(['admin']), (req, res) => {
  return res.status(200).json({ message: 'Welcome to Admin Dashboard (JWT)' })
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`)
})
