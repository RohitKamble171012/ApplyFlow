require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const googleRoutes = require('./routes/google.routes');
const gmailRoutes = require('./routes/gmail.routes');
const emailRoutes = require('./routes/email.routes');
const applicationRoutes = require('./routes/application.routes');
const labelRoutes = require('./routes/label.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const syncRoutes = require('./routes/sync.routes');
const calendarRoutes = require('./routes/calendar.routes');

const app = express();
app.set('trust proxy', 1); // Trust Render's reverse proxy

const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api/auth',         authRoutes);
app.use('/api/google',       googleRoutes);
app.use('/api/gmail',        gmailRoutes);
app.use('/api/emails',       emailRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/labels',       labelRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/sync',         syncRoutes);
app.use('/api/calendar',     calendarRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 ApplyFlow server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
