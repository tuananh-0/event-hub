const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

// Import middleware xác thực và phân quyền
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route công khai (GET) / Route bảo vệ (POST)
router.route('/')
  .get(getEvents)
  .post(protect, authorize('organizer', 'admin'), createEvent);

// Route công khai (GET theo ID) / Route bảo vệ (PUT, DELETE theo ID)
router.route('/:id')
  .get(getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;