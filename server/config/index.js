require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// CORS configuration
const corsOptions = {
  origin: isProduction
    ? ['https://slotbooking1-slog-solutions-projects.vercel.app']
    : (origin, callback) => {
        // Allow any localhost origin in development
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200, // Changed from 204 to avoid issues
  maxAge: 86400,
};

module.exports = {
  isProduction,
  PORT,
  supabase,
  corsOptions,
};
