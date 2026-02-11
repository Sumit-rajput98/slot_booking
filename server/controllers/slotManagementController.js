const { supabase } = require('../config');
const moment = require('moment');

// Helper function for audit logging
async function logAudit(adminId, action, entityType, entityId, oldValues, newValues, req) {
  try {
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      admin_username: req.admin?.username || 'system',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('user-agent')
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}

class SlotManagementController {
  // GET /api/admin/slot-management/configurations
  async getSlotConfigurations(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      let query = supabase
        .from('slot_configurations')
        .select('*')
        .order('date', { ascending: true });

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;
      if (error) throw error;

      res.json(data || []);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/slot-management/configuration
  async createSlotConfiguration(req, res, next) {
    try {
      const { date, status, maxSlots, reason } = req.body;
      const adminId = req.admin?.id;

      // Validate status
      const validStatuses = ['open', 'half_day_pre', 'half_day_post', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Calculate max slots based on status
      let calculatedMaxSlots = maxSlots || 1200;
      if (status === 'half_day_pre' || status === 'half_day_post') {
        // Half day should be 50% of the provided max slots
        calculatedMaxSlots = Math.floor(calculatedMaxSlots / 2);
      } else if (status === 'closed') {
        calculatedMaxSlots = 0;
      }

      // Check if configuration already exists
      const { data: existing } = await supabase
        .from('slot_configurations')
        .select('id')
        .eq('date', date)
        .single();

      let result;
      if (existing) {
        // Update existing
        result = await supabase
          .from('slot_configurations')
          .update({
            status,
            max_slots: calculatedMaxSlots,
            reason,
            updated_at: new Date().toISOString()
          })
          .eq('date', date)
          .select()
          .single();
      } else {
        // Create new
        result = await supabase
          .from('slot_configurations')
          .insert({
            date,
            status,
            max_slots: calculatedMaxSlots,
            reason,
            created_by: adminId
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Log audit
      await logAudit(adminId, 'CREATE_SLOT_CONFIG', 'slot_configuration', result.data.id, null, result.data, req);

      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/slot-management/configuration/:id
  async updateSlotConfiguration(req, res, next) {
    try {
      const { id } = req.params;
      const { status, maxSlots, reason } = req.body;
      const adminId = req.admin?.id;

      // Get old values for audit
      const { data: oldData } = await supabase
        .from('slot_configurations')
        .select('*')
        .eq('id', id)
        .single();

      // Calculate max slots based on status
      let calculatedMaxSlots = maxSlots || 1200;
      if (status === 'half_day_pre' || status === 'half_day_post') {
        // Half day should be 50% of the provided max slots
        calculatedMaxSlots = Math.floor(calculatedMaxSlots / 2);
      } else if (status === 'closed') {
        calculatedMaxSlots = 0;
      }

      const { data, error } = await supabase
        .from('slot_configurations')
        .update({
          status,
          max_slots: calculatedMaxSlots,
          reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'UPDATE_SLOT_CONFIG', 'slot_configuration', id, oldData, data, req);

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/slot-management/configuration/:id
  async deleteSlotConfiguration(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;

      // Get old values for audit
      const { data: oldData } = await supabase
        .from('slot_configurations')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('slot_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'DELETE_SLOT_CONFIG', 'slot_configuration', id, oldData, null, req);

      res.json({ message: 'Slot configuration deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/slot-management/recurring-rules
  async getRecurringRules(req, res, next) {
    try {
      const { data, error } = await supabase
        .from('recurring_slot_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/slot-management/recurring-rule
  async createRecurringRule(req, res, next) {
    try {
      const { ruleType, dayOfWeek, dayOfMonth, startDate, endDate, status, maxSlots, reason } = req.body;
      const adminId = req.admin?.id;

      // Calculate max slots based on status
      let calculatedMaxSlots = maxSlots || 1200;
      if (status === 'half_day_pre' || status === 'half_day_post') {
        // Half day should be 50% of the provided max slots
        calculatedMaxSlots = Math.floor(calculatedMaxSlots / 2);
      } else if (status === 'closed') {
        calculatedMaxSlots = 0;
      }

      const { data, error } = await supabase
        .from('recurring_slot_rules')
        .insert({
          rule_type: ruleType,
          day_of_week: dayOfWeek,
          day_of_month: dayOfMonth,
          start_date: startDate,
          end_date: endDate,
          status,
          max_slots: calculatedMaxSlots,
          reason,
          created_by: adminId
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'CREATE_RECURRING_RULE', 'recurring_rule', data.id, null, data, req);

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/slot-management/recurring-rule/:id
  async updateRecurringRule(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive, status, maxSlots, reason } = req.body;
      const adminId = req.admin?.id;

      // Get old values
      const { data: oldData } = await supabase
        .from('recurring_slot_rules')
        .select('*')
        .eq('id', id)
        .single();

      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (isActive !== undefined) updateData.is_active = isActive;
      if (status) updateData.status = status;
      if (maxSlots) updateData.max_slots = maxSlots;
      if (reason !== undefined) updateData.reason = reason;

      const { data, error } = await supabase
        .from('recurring_slot_rules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'UPDATE_RECURRING_RULE', 'recurring_rule', id, oldData, data, req);

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/slot-management/recurring-rule/:id
  async deleteRecurringRule(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;

      // Get old values
      const { data: oldData } = await supabase
        .from('recurring_slot_rules')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('recurring_slot_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'DELETE_RECURRING_RULE', 'recurring_rule', id, oldData, null, req);

      res.json({ message: 'Recurring rule deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/slot-management/availability
  async getSlotAvailability(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate || moment().format('YYYY-MM-DD');
      const end = endDate || moment().add(30, 'days').format('YYYY-MM-DD');

      // Get slot configurations
      const { data: configs } = await supabase
        .from('slot_configurations')
        .select('*')
        .gte('date', start)
        .lte('date', end);

      // Get bookings count per day
      const { data: bookings } = await supabase
        .from('bookings')
        .select('date, status')
        .gte('date', start)
        .lte('date', end)
        .neq('status', 'cancelled');

      // Build availability map
      const availability = [];
      let currentDate = moment(start);
      const endMoment = moment(end);

      while (currentDate.isSameOrBefore(endMoment)) {
        const dateStr = currentDate.format('YYYY-MM-DD');
        const config = configs?.find(c => c.date === dateStr);
        const dayBookings = bookings?.filter(b => b.date === dateStr).length || 0;
        
        const maxSlots = config?.max_slots ?? 1200;
        const status = config?.status || 'open';

        availability.push({
          date: dateStr,
          status,
          maxSlots,
          bookedSlots: dayBookings,
          availableSlots: Math.max(0, maxSlots - dayBookings),
          reason: config?.reason || null
        });

        currentDate.add(1, 'day');
      }

      res.json(availability);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SlotManagementController();
