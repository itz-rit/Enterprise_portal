const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createTask, getTasks, updateTask } = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTasks).post(protect, admin, [
  body('clientName').isLength({ min: 2 }).withMessage('Client name must be at least 2 characters'),
  body('contactNumber').isMobilePhone().withMessage('Please provide a valid contact number'),
  body('assignedTo').isMongoId().withMessage('Assigned to must be a valid user ID'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
], createTask);

router.route('/:id').put(protect, updateTask);

module.exports = router;
