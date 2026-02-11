const { supabase } = require('../config');

// Middleware to verify admin authentication
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify admin session
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*, admin_users(*)')
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Attach admin info to request
    req.admin = {
      id: data.admin_users.id,
      username: data.admin_users.username,
      role: data.admin_users.role,
      full_name: data.admin_users.full_name
    };

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = adminAuth;
