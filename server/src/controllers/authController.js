const User = require('../models/User');

// Hàm gửi Token phản hồi về cho Client
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

// @desc    Đăng ký tài khoản người dùng
// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
    }

    // Tạo tài khoản mới
    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Đăng nhập
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    // Tìm người dùng và lấy cả trường password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không chính xác' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không chính xác' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lấy thông tin người dùng đang đăng nhập
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};