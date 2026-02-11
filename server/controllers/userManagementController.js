const { supabase } = require('../config');

class UserManagementController {
  // GET /api/admin/users
  async getAllUsers(req, res, next) {
    try {
      const { role, search, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('admin_users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (role) query = query.eq('role', role);
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      res.json({
        users: data || [],
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/users/:id
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/users/:id/role
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.admin?.id;

      const validRoles = ['ADMIN', 'JCO', 'CO'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      // Get old data for audit
      const { data: oldData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('admin_users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: adminId,
        admin_username: req.admin?.username || 'system',
        action: 'UPDATE_USER_ROLE',
        entity_type: 'admin_user',
        entity_id: id,
        old_values: { role: oldData.role },
        new_values: { role: data.role },
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent')
      });

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;

      // Prevent self-deletion
      if (parseInt(id) === adminId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Get user data for audit
      const { data: userData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single();

      // Delete admin user
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: adminId,
        admin_username: req.admin?.username || 'system',
        action: 'DELETE_USER',
        entity_type: 'admin_user',
        entity_id: id,
        old_values: userData,
        new_values: null,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent')
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/users/stats
  async getUserStats(req, res, next) {
    try {
      const { data: users, error } = await supabase
        .from('admin_users')
        .select('role, created_at');

      if (error) throw error;

      const stats = {
        totalUsers: users?.length || 0,
        byRole: {
          ADMIN: 0,
          JCO: 0,
          CO: 0
        },
        recentRegistrations: 0
      };

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      users?.forEach(user => {
        if (user.role) {
          stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
        }
        if (new Date(user.created_at) > thirtyDaysAgo) {
          stats.recentRegistrations++;
        }
      });

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/users (create new admin user)
  async createUser(req, res, next) {
    try {
      const { username, password, fullName, role } = req.body;
      const adminId = req.admin?.id;

      if (!username || !password || !fullName) {
        return res.status(400).json({ error: 'Username, password, and full name are required' });
      }

      const validRoles = ['ADMIN', 'JCO', 'CO'];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          username,
          password, // In production, hash this with bcrypt
          full_name: fullName,
          role: role || 'CO'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          return res.status(400).json({ error: 'Username already exists' });
        }
        throw error;
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        admin_id: adminId,
        admin_username: req.admin?.username || 'system',
        action: 'CREATE_USER',
        entity_type: 'admin_user',
        entity_id: data.id,
        old_values: null,
        new_values: { username: data.username, role: data.role },
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent')
      });

      // Don't send password back
      const { password: _, ...userWithoutPassword } = data;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserManagementController();
