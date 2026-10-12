const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên sự kiện'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả sự kiện']
  },
  date: {
    type: Date,
    required: [true, 'Vui lòng nhập thời gian diễn ra']
  },
  // Phân loại hình thức sự kiện: Online hoặc Offline
  eventType: {
    type: String,
    enum: ['offline', 'online', 'hybrid'],
    default: 'offline'
  },
  location: {
    type: String,
    required: [true, 'Vui lòng nhập địa điểm hoặc Link tham gia Online']
  },
  // Đường dẫn livestream / meeting dành cho sự kiện Online (YouTube, Twitch, Jitsi...)
  streamUrl: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  // Phân loại sự kiện có phí hay miễn phí
  isPaid: {
    type: Boolean,
    default: false
  },
  // Giá vé mặc định (nếu có)
  price: {
    type: Number,
    default: 0
  },
  // Các hạng vé nâng cao (Ví dụ: Standard, VIP)
  ticketTypes: [
    {
      name: { type: String, required: true }, // Tên hạng vé (ví dụ: 'Vé VIP')
      price: { type: Number, required: true }, // Giá vé
      quantity: { type: Number, required: true }, // Tổng số lượng vé loại này
      sold: { type: Number, default: 0 } // Số lượng vé đã bán
    }
  ],
  capacity: {
    type: Number,
    default: 100
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);