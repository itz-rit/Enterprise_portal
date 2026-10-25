const express = require('express');
const router = express.Router();
const { getAllTasks, createTask, adminUpdateTask, deleteTask, transferTask } = require('../../controllers/taskController');
const { protect, admin } = require('../../middleware/authMiddleware');

router.use(protect, admin);

router.route('/').get(getAllTasks).post(createTask);
router.route('/:id/transfer').put(transferTask);
router.route('/:id').put(adminUpdateTask).delete(deleteTask);

module.exports = router;
