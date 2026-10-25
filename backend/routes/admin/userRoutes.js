const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, updateUser, deleteUser } = require('../../controllers/userController');
const { protect, admin } = require('../../middleware/authMiddleware');

// All routes here: 403 if not Admin
router.use(protect, admin);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
