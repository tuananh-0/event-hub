const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes

const app = express();

// Kết nối Cơ sở dữ liệu MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes); // Khai báo đường dẫn API Authentication

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', message: 'Event Hub API Server đang chạy thành công!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng http://localhost:${PORT}`);
});
