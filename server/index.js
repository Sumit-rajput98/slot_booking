// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');

// const { PORT, corsOptions } = require('./config');
// const slotRoutes = require('./routes/slotRoutes');
// const bookingRoutes = require('./routes/bookingRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const profileRoutes = require('./routes/profileRoutes');

// const app = express();

// // ==========================================
// // 1. SECURITY & CORS (MUST BE FIRST)
// // ==========================================

// // CORS - Single, correct configuration
// // The cors middleware handles both preflight and actual requests
// console.log('CORS options:', corsOptions);
// app.use(cors(corsOptions));

// // Security headers (CSP disabled for API)
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     crossOriginEmbedderPolicy: false,
//   })
// );

// // ==========================================
// // 2. REQUEST PARSING & LOGGING
// // ==========================================
// app.use(express.json());
// app.use(morgan('dev'));

// // ==========================================
// // 3. HEALTH CHECK
// // ==========================================
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // ==========================================
// // 4. API ROUTES
// // ==========================================
// app.use('/api/slots', slotRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/profile', profileRoutes);

// // ==========================================
// // 5. ERROR HANDLING
// // ==========================================

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err.message);
  
//   // Handle CORS errors specifically
//   if (err.message === 'Not allowed by CORS') {
//     return res.status(403).json({ error: 'CORS not allowed' });
//   }
  
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal server error',
//   });
// });

// // ==========================================
// // 6. START SERVER
// // ==========================================
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
//   console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`,
//     console.log(`📍 CORS options: ${corsOptions} BaseURl -> ${process.env.BASE_URL}`)
//   );
// });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

// ================================
// 1. BASIC SETUP
// ================================

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// ================================
// 2. VALIDATE ENV VARIABLES
// ================================

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

// ================================
// 3. SUPABASE CLIENT
// ================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

// ================================
// 4. SECURITY & CORS (FIRST)
// ================================
// ================================
// 4. SECURITY & CORS (WITH DEBUG)
// ================================

const allowedOrigins = [
  'http://localhost:3000',
  'https://slot-booking-lime.vercel.app',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🌍 Incoming Origin:', origin);

      // Mobile apps / Postman (no origin header)
      if (!origin) {
        console.log('✅ Allowed: No origin (Mobile/Postman)');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('✅ Allowed Origin:', origin);
        return callback(null, true);
      }

      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Optional: Log every request method + URL
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// ================================
// 5. MIDDLEWARE
// ================================

app.use(express.json());
app.use(morgan('dev'));

// ================================
// 6. ROUTES
// ================================

const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const slotManagementRoutes = require('./routes/slotManagementRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const authRoutes = require('./routes/authRoutes');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin/slot-management', slotManagementRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);

// ================================
// 7. ERROR HANDLING
// ================================

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ================================
// 8. START SERVER
// ================================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'} BaseURL -> ${process.env.BASE_URL}`);
});
