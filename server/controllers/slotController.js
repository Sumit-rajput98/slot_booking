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

      // Check slot configuration for this date
      const { data: config } = await supabase
        .from('slot_configurations')
        .select('*')
        .eq('date', date)
        .single();

      const maxBookings = config?.max_slots ?? 1200;
      const status = config?.status || 'open';
      const reason = config?.reason || null;

      // If closed, return empty slots
      if (status === 'closed') {
        return res.json({
          date,
          status: 'closed',
          reason,
          slotStatus: [],
          availableSlots: [],
          fullyBookedSlots: [],
          allSlots: [],
          totalBookings: 0,
          maxBookings: 0,
        });
      }

      // Define time slots based on status
      let timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00',
        '11:30', '12:00', '15:00', '15:30', '16:00'
      ];

      // Adjust slots for half day
      if (status === 'half_day_pre') {
        timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00'];
      } else if (status === 'half_day_post') {
        timeSlots = ['15:00', '15:30', '16:00', '16:30', '17:00'];
      }

      const { data } = await supabase
        .from('bookings')
        .select('time_slot')
        .eq('date', date)
        .neq('status', 'cancelled');

      const slotBookings = {};
      (data || []).forEach(row => {
        const t = row.time_slot.substring(0, 5);
        slotBookings[t] = (slotBookings[t] || 0) + 1;
      });

      const maxPerSlot = Math.floor(maxBookings / timeSlots.length);

      const slotStatus = timeSlots.map(slot => {
        const count = slotBookings[slot] || 0;
        return {
          time: slot,
          bookingCount: count,
          maxCapacity: maxPerSlot,
          isAvailable: count < maxPerSlot,
          isFullyBooked: count >= maxPerSlot,
          availableSpots: Math.max(0, maxPerSlot - count),
        };
      });

      res.json({
        date,
        status,
        reason,
        slotStatus,
        availableSlots: slotStatus.filter(s => s.isAvailable).map(s => s.time),
        fullyBookedSlots: slotStatus.filter(s => s.isFullyBooked).map(s => s.time),
        allSlots: timeSlots,
        totalBookings: Object.values(slotBookings).reduce((a, b) => a + b, 0),
        maxBookings,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/slots/status/overall
  async getSlotStatus(req, res, next) {
    try {
      const targetDate = req.query.date || moment().format('YYYY-MM-DD');

      // Check slot configuration
      const { data: config } = await supabase
        .from('slot_configurations')
        .select('*')
        .eq('date', targetDate)
        .single();

      const maxSlots = config?.max_slots ?? 1200;
      const status = config?.status || 'open';

      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('date', targetDate)
        .neq('status', 'cancelled');

      res.json({
        date: targetDate,
        status,
        totalBookings: count || 0,
        maxSlots,
        availableSlots: Math.max(0, maxSlots - (count || 0)),
        reason: config?.reason || null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SlotController();
