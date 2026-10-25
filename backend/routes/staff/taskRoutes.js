const express = require('express');
const router = express.Router();
const { getMyTasks, staffUpdateTask } = require('../../controllers/taskController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

// Staff can ONLY see their own tasks and submit limited updates
router.route('/').get(getMyTasks);
router.route('/:id').put(staffUpdateTask);

module.exports = router;
