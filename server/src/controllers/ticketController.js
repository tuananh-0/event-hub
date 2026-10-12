const crypto = require('crypto');
const Event = require('../models/Event');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');

// @desc    1. Tạo đơn hàng & Đăng ký mua vé (Order)
// @route   POST /api/v1/tickets/purchase
// @access  Private (Chỉ người dùng đã đăng nhập)
exports.purchaseTicket = async (req, res) => {
  try {
    const { eventId, ticketTypeName, quantity = 1, paymentMethod = 'free' } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    }

    // Tính toán tổng tiền
    let unitPrice = event.price || 0;
    if (event.ticketTypes && event.ticketTypes.length > 0 && ticketTypeName) {
      const selectedType = event.ticketTypes.find(t => t.name === ticketTypeName);
      if (selectedType) {
        unitPrice = selectedType.price;
        // Kiểm tra số lượng vé còn lại của hạng vé
        if (selectedType.sold + quantity > selectedType.quantity) {
          return res.status(400).json({ success: false, message: 'Hạng vé này đã hết số lượng' });
        }
      }
    }

    const totalAmount = unitPrice * quantity;

    // Tạo đơn hàng Order ở trạng thái 'pending' (nếu có phí) hoặc 'completed' (nếu miễn phí 0đ)
    const isFree = totalAmount === 0;
    const order = await Order.create({
      user: req.user.id,
      event: eventId,
      quantity,
      totalAmount,
      paymentMethod: isFree ? 'free' : paymentMethod,
      paymentStatus: isFree ? 'completed' : 'pending'
    });

    // Nếu sự kiện miễn phí (0đ), tự động sinh vé luôn
    if (isFree) {
      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticketCode = 'TIC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
        const ticket = await Ticket.create({
          event: eventId,
          user: req.user.id,
          ticketType: ticketTypeName || 'Standard',
          price: 0,
          ticketCode
        });
        tickets.push(ticket);
      }

      // Cập nhật số lượng vé đã bán trong Event
      event.capacity = Math.max(0, event.capacity - quantity);
      await event.save();

      return res.status(201).json({
        success: true,
        message: 'Đăng ký vé miễn phí thành công!',
        data: { order, tickets }
      });
    }

    // Nếu sự kiện có phí, trả về thông tin Order để Client chuyển hướng thanh toán (VNPay / MoMo / VietQR)
    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công, vui lòng tiến hành thanh toán',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    2. Giả lập / Callback xác nhận thanh toán thành công
// @route   POST /api/v1/tickets/confirm-payment/:orderId
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Đơn hàng này đã thanh toán trước đó' });
    }

    // Cập nhật trạng thái Order thành 'completed'
    order.paymentStatus = 'completed';
    order.transactionId = 'TXN-' + Date.now();
    await order.save();

    // Tự động khởi tạo danh sách Vé (Ticket) kèm Mã QR
    const tickets = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticketCode = 'TIC-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      const ticket = await Ticket.create({
        event: order.event,
        user: order.user,
        price: order.totalAmount / order.quantity,
        ticketCode
      });
      tickets.push(ticket);
    }

    res.status(200).json({
      success: true,
      message: 'Thanh toán thành công! Vé điện tử đã được sinh ra.',
      data: { order, tickets }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    3. Lấy danh sách Vé điện tử của người dùng đang đăng nhập
// @route   GET /api/v1/tickets/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title date location eventType streamUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    4. Quét mã QR để Check-in tại cổng sự kiện
// @route   POST /api/v1/tickets/checkin
// @access  Private (Chỉ Organizer / Admin)
exports.checkInTicket = async (req, res) => {
  try {
    const { ticketCode } = req.body;

    const ticket = await Ticket.findOne({ ticketCode })
      .populate('event', 'title user')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Mã vé không hợp lệ!' });
    }

    // Kiểm tra quyền: Chỉ Organizer tạo ra sự kiện này mới được check-in
    if (ticket.event.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền check-in cho sự kiện này' });
    }

    if (ticket.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: `Vé này đã được check-in lúc ${ticket.checkedInAt.toLocaleTimeString('vi-VN')}!`
      });
    }

    // Đổi trạng thái Check-in
    ticket.isCheckedIn = true;
    ticket.checkedInAt = Date.now();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: `Check-in thành công cho khán giả: ${ticket.user.name}`,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};