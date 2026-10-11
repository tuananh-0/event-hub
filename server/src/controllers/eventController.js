const Event = require('../models/Event');

// @desc    Lấy danh sách tất cả sự kiện
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate({ path: 'user', select: 'name email' })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy chi tiết 1 sự kiện theo ID
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Tạo sự kiện mới
// @route   POST /api/v1/events
// @access  Private (Chỉ Organizer / Admin)
exports.createEvent = async (req, res) => {
  try {
    // Tự động gán ID của người dùng đang đăng nhập vào trường user
    req.body.user = req.user.id;

    const newEvent = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: newEvent
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Cập nhật thông tin sự kiện
// @route   PUT /api/v1/events/:id
// @access  Private (Chỉ chủ sự kiện hoặc Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    }

    // Kiểm tra xem người dùng có phải là người tạo sự kiện hoặc Admin không
    if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa sự kiện này'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Xóa sự kiện
// @route   DELETE /api/v1/events/:id
// @access  Private (Chỉ chủ sự kiện hoặc Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự kiện' });
    }

    // Kiểm tra xem người dùng có phải là người tạo sự kiện hoặc Admin không
    if (event.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa sự kiện này'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Đã xóa sự kiện thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};