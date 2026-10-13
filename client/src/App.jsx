import { useEffect, useState } from 'react';
import eventApi from './api/eventApi';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await eventApi.getAllEvents();
      // Kiểm tra nếu res.data tồn tại thì lấy, không thì lấy res
      const eventList = res.data || res || [];
      setEvents(Array.isArray(eventList) ? eventList : []);
    } catch (err) {
      console.error('Lỗi kết nối API:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchEvents();
}, []);


  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Event & Workshop Hub 🚀</h1>
      <h2>Danh sách Sự kiện từ Backend API</h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : events.length === 0 ? (
        <p>Chưa có sự kiện nào trong CSDL.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event._id} style={{ marginBottom: '10px' }}>
              <strong>{event.title}</strong> - {new Date(event.date).toLocaleDateString('vi-VN')} ({event.isPaid ? `${event.price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;