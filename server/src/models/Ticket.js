const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    type: String,
    default: 'Standard'
  },
  price: {
    type: Number,
    default: 0
  },
  // Mã vé định danh duy nhất (dùng để tạo QR Code)
  ticketCode: {
    type: String,
    unique: true,
    required: true
  },
  // Trạng thái Check-in tại sự kiện
  isCheckedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);