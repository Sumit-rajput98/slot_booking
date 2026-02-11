const moment = require('moment');
const { validationResult } = require('express-validator');
const { supabase } = require('../config');

class BookingController {
  constructor() {
    this.checkWeeklyBookingRestriction = this.checkWeeklyBookingRestriction.bind(this);
    this.createBooking = this.createBooking.bind(this);
    this.getWeeklyStatus = this.getWeeklyStatus.bind(this);
  }

  // Helper: Check weekly booking limit
  async checkWeeklyBookingRestriction(phone, slotDate) {
    const startOfWeek = moment(slotDate).startOf('week').format('YYYY-MM-DD');
    const endOfWeek = moment(slotDate).endOf('week').format('YYYY-MM-DD');

    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('phone', phone)
      .gte('date', startOfWeek)
      .lte('date', endOfWeek);

    return count || 0;
  }

  // POST /api/bookings
  async createBooking(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, date, name, armyNumber } = req.body;
      
      // Check weekly limit
      const weekly = await this.checkWeeklyBookingRestriction(phone, date);
      
      if (weekly > 0) {
        return res.status(409).json({ error: 'Weekly limit reached' });
      }

      // Save booking
      const { data, error } = await supabase
        .from('bookings')
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      // Also save/update profile in public_profile table
      if (armyNumber && name && phone) {
        try {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('public_profile')
            .select('id')
            .eq('army_number', armyNumber)
            .single();

          if (existingProfile) {
            // Update existing profile
            await supabase
              .from('public_profile')
              .update({
                name,
                mobile: phone,
                updated_at: new Date().toISOString()
              })
              .eq('army_number', armyNumber);
          } else {
            // Create new profile
            await supabase
              .from('public_profile')
              .insert({
                army_number: armyNumber,
                name,
                mobile: phone,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
        } catch (profileError) {
          console.error('Error saving profile from booking:', profileError);
          // Don't fail the booking if profile save fails
        }
      }

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/user/weekly-status
  async getWeeklyStatus(req, res, next) {
    try {
      const { phone, date } = req.query;
      
      if (!phone) {
        return res.status(400).json({ error: 'Phone number required' });
      }

      const count = await this.checkWeeklyBookingRestriction(phone, date);
      
      res.json({
        hasBookedThisWeek: count > 0,
        bookingsThisWeek: count,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();
