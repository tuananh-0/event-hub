const express = require('express');
const router = express.Router();
const {
  purchaseTicket,
  confirmPayment,
  getMyTickets,
  checkInTicket
} = require('../controllers/ticketController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// Tất cả các route vé đều yêu cầu đăng nhập (protect)
router.use(protect);

router.post('/purchase', purchaseTicket);
router.post('/confirm-payment/:orderId', confirmPayment);
router.get('/my-tickets', getMyTickets);

// Route quét mã QR Check-in dành cho Organizer / Admin
router.post('/checkin', authorize('organizer', 'admin'), checkInTicket);

module.exports = router;