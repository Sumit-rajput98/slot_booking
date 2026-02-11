const XLSX = require('xlsx');
const { supabase } = require('../config');

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

class AdminController {
  // GET /api/admin/bookings
  async getAllBookings(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      let query = supabase.from('bookings').select('*');

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/stats
  async getStats(req, res, next) {
    try {
      const { data: allBookings, error } = await supabase
        .from('bookings')
        .select('id');

      if (error) throw error;

      const totalBookings = allBookings?.length || 0;
      const maxBookings = 1200;

      res.json({
        totalBookings,
        availableBookings: maxBookings - totalBookings,
        maxBookings,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/bookings/:id
  async deleteBooking(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.admin?.id;

      // Get booking data for audit
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('bookings').delete().eq('id', id);

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'DELETE_BOOKING', 'booking', id, bookingData, null, req);

      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/bookings (bulk)
  async deleteMultipleBookings(req, res, next) {
    try {
      const { ids } = req.body;
      const adminId = req.admin?.id;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No booking IDs provided' });
      }

      // Get bookings data for audit
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .in('id', ids);

      const { error } = await supabase.from('bookings').delete().in('id', ids);

      if (error) throw error;

      // Log audit for each deleted booking
      for (const booking of bookingsData || []) {
        await logAudit(adminId, 'DELETE_BOOKING_BULK', 'booking', booking.id, booking, null, req);
      }

      res.json({ message: `${ids.length} booking(s) deleted successfully` });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/export
  async exportBookings(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      let query = supabase.from('bookings').select('*');

      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data, error } = await query;

      if (error) throw error;

      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(data || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.xlsx');
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/bookings/:id/status
  async updateBookingStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminId = req.admin?.id;

      const validStatuses = ['confirmed', 'cancelled', 'completed', 'no_show'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Get old data for audit
      const { data: oldData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await logAudit(adminId, 'UPDATE_BOOKING_STATUS', 'booking', id, oldData, data, req);

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/analytics
  async getAnalytics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      // Get bookings data
      let query = supabase.from('bookings').select('*');
      if (startDate) query = query.gte('date', startDate);
      if (endDate) query = query.lte('date', endDate);

      const { data: bookings, error } = await query;
      if (error) throw error;

      // Calculate analytics
      const analytics = {
        totalBookings: bookings?.length || 0,
        byStatus: {
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          no_show: 0
        },
        byPurpose: {},
        byLocation: {},
        byTimeSlot: {},
        dailyTrend: {}
      };

      bookings?.forEach(booking => {
        // By status
        const status = booking.status || 'confirmed';
        analytics.byStatus[status] = (analytics.byStatus[status] || 0) + 1;

        // By purpose
        analytics.byPurpose[booking.purpose] = (analytics.byPurpose[booking.purpose] || 0) + 1;

        // By location
        analytics.byLocation[booking.location] = (analytics.byLocation[booking.location] || 0) + 1;

        // By time slot
        analytics.byTimeSlot[booking.time_slot] = (analytics.byTimeSlot[booking.time_slot] || 0) + 1;

        // Daily trend
        analytics.dailyTrend[booking.date] = (analytics.dailyTrend[booking.date] || 0) + 1;
      });

      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
