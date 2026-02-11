const { supabase } = require('../config');

class AuthController {
  // Admin login with username/password
  async adminLogin(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Check against admin credentials
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password) // In production, use bcrypt for password hashing
        .single();

      if (error || !data) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session token (simple implementation)
      const sessionToken = Buffer.from(`${data.id}:${Date.now()}`).toString('base64');

      // Store session
      await supabase.from('admin_sessions').insert({
        admin_id: data.id,
        token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

      res.json({
        success: true,
        token: sessionToken,
        admin: {
          id: data.id,
          username: data.username,
          role: data.role,
          full_name: data.full_name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin logout
  async adminLogout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (token) {
        await supabase
          .from('admin_sessions')
          .delete()
          .eq('token', token);
      }

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  // User login (no password - just verify identity)
  async userLogin(req, res, next) {
    try {
      const { mobile, armyNumber, name } = req.body;

      if (!mobile || !armyNumber || !name) {
        return res.status(400).json({ 
          error: 'Mobile number, army number, and name are required' 
        });
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('public_profile')
        .select('*')
        .eq('army_number', armyNumber)
        .single();

      let profile;

      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('public_profile')
          .update({
            name,
            mobile,
            updated_at: new Date().toISOString()
          })
          .eq('army_number', armyNumber)
          .select()
          .single();

        if (error) throw error;
        profile = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('public_profile')
          .insert({
            army_number: armyNumber,
            name,
            mobile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        profile = data;
      }

      // Create simple session token
      const sessionToken = Buffer.from(`user:${armyNumber}:${Date.now()}`).toString('base64');

      res.json({
        success: true,
        token: sessionToken,
        user: {
          armyNumber: profile.army_number,
          name: profile.name,
          mobile: profile.mobile
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify admin session
  async verifyAdminSession(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*, admin_users(*)')
        .eq('token', token)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      res.json({
        success: true,
        admin: {
          id: data.admin_users.id,
          username: data.admin_users.username,
          role: data.admin_users.role,
          full_name: data.admin_users.full_name
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
