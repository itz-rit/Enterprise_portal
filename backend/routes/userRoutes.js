const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getAllUsers).post(protect, admin, [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'Staff']).withMessage('Role must be Admin or Staff'),
  body('base_salary').optional().isNumeric().withMessage('Base salary must be a number'),
], createUser);

router.route('/:id').get(protect, getUserById).put(protect, admin, [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'Staff']).withMessage('Role must be Admin or Staff'),
  body('base_salary').optional().isNumeric().withMessage('Base salary must be a number'),
  body('advanceOutstanding').optional().isNumeric().withMessage('Advance taken must be a number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false'),
], updateUser).delete(protect, admin, deleteUser);

module.exports = router;
