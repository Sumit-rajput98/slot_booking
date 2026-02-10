const XLSX = require('xlsx');
const { supabase } = require('../config');

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
      const { error } = await supabase.from('bookings').delete().eq('id', id);

      if (error) throw error;
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/bookings (bulk)
  async deleteMultipleBookings(req, res, next) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'No booking IDs provided' });
      }

      const { error } = await supabase.from('bookings').delete().in('id', ids);

      if (error) throw error;
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
}

module.exports = new AdminController();
