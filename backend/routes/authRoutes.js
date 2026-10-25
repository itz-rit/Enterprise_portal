const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login } = require('../controllers/authController');

router.post('/login', [
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], login);

module.exports = router;
