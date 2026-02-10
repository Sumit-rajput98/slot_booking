const moment = require('moment');
const { supabase } = require('../config');

class SlotController {
  // GET /api/slots/:date
  async getSlots(req, res, next) {
    try {
      const { date } = req.params;

      if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00',
        '11:30', '12:00', '15:00', '15:30', '16:00'
      ];

      const { data } = await supabase
        .from('bookings')
        .select('time_slot')
        .eq('date', date);

      const slotBookings = {};
      (data || []).forEach(row => {
        const t = row.time_slot.substring(0, 5);
        slotBookings[t] = (slotBookings[t] || 0) + 1;
      });

      const slotStatus = timeSlots.map(slot => {
        const count = slotBookings[slot] || 0;
        return {
          time: slot,
          bookingCount: count,
          maxCapacity: 120,
          isAvailable: count < 120,
          isFullyBooked: count >= 120,
          availableSpots: Math.max(0, 120 - count),
        };
      });

      res.json({
        date,
        slotStatus,
        availableSlots: slotStatus.filter(s => s.isAvailable).map(s => s.time),
        fullyBookedSlots: slotStatus.filter(s => s.isFullyBooked).map(s => s.time),
        allSlots: timeSlots,
        totalBookings: Object.values(slotBookings).reduce((a, b) => a + b, 0),
        maxBookings: 1200,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/slots/status/overall
  async getSlotStatus(req, res, next) {
    try {
      const targetDate = req.query.date || moment().format('YYYY-MM-DD');

      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('date', targetDate);

      res.json({
        date: targetDate,
        totalBookings: count || 0,
        maxSlots: 1200,
        availableSlots: Math.max(0, 1200 - (count || 0))
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SlotController();
