const { body } = require('express-validator');

const validateBooking = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Invalid phone number'),
  body('purpose').notEmpty().withMessage('Purpose is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('date').isISO8601().withMessage('Invalid date format'),
  body('time_slot').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time slot format'),
];

module.exports = { validateBooking };
