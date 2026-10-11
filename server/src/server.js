const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Đường dẫn thử nghiệm (API endpoint)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'Event Hub API Server đang chạy thành công!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng http://localhost:${PORT}`);
});