const express = require('express');
const router = express.Router();

// Ví dụ route tạm thời
router.get('/', (req, res) => {
  res.json({ success: true, message: 'API Event Routes đang hoạt động!' });
});

module.exports = router;