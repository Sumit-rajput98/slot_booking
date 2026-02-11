// require('dotenv').config();
// const { createClient } = require('@supabase/supabase-js');

// const isProduction = process.env.NODE_ENV === 'production';
// const PORT = process.env.PORT || 5000;

// // Validate required environment variables
// const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
// const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

// if (missingVars.length > 0) {
//   console.error('❌ Missing environment variables:', missingVars.join(', '));
//   process.exit(1);
// }

// // Supabase client
// const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
//   auth: { persistSession: false },
// });

// // CORS configuration - Allow localhost in both dev and production for testing
// const corsOptions = {
//   origin: (origin, callback) => {
//     // Allow requests with no origin (like mobile apps or curl requests)
//     if (!origin) return callback(null, true);
    
//     // Allow localhost origins and the deployed frontend
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'http://127.0.0.1:3000',
//       'https://slot-booking-lime.vercel.app', // Your Vercel deployment
//     ];
    
//     if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
//       callback(null, true);
//     } else {
//       console.log('CORS blocked origin:', origin);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
//   optionsSuccessStatus: 200,
//   maxAge: 86400,
// };

// module.exports = {
//   isProduction,
//   PORT,
//   supabase,
//   corsOptions,
// };
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

/* ================================
   Validate Required Env Variables
================================ */
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:', missingVars.join(', '));
  process.exit(1);
}

/* ================================
   Supabase Client
================================ */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: { persistSession: false },
  }
);

/* ================================
   CORS Configuration (Clean)
================================ */

// Allowed origins list
const allowedCors = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.BASEURL, // From environment
  'https://slot-booking-lime.vercel.app',
].filter(Boolean); // removes undefined if BASEURL not set

// CORS middleware
const corsMiddleware = cors({
  origin: function (origin, callback) {
    console.log('CORS origin:', origin);
    if (!origin) return callback(null, true); // allow mobile apps / curl
  else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});

module.exports = {
  isProduction,
  PORT,
  supabase,
  corsMiddleware,
};
