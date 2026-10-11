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
  location: {
    type: String,
    required: [true, 'Vui lòng nhập địa điểm/Link Online']
  },
  category: {
    type: String,
    default: 'General'
  },
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