import axiosClient from './axiosClient';

const eventApi = {
  // Lấy danh sách sự kiện
  getAllEvents: () => {
    return axiosClient.get('/events');
  },
  
  // Lấy chi tiết 1 sự kiện
  getEventById: (id) => {
    return axiosClient.get(`/events/${id}`);
  },

  // Tạo sự kiện mới (chỉ Organizer / Admin)
  createEvent: (data) => {
    return axiosClient.post('/events', data);
  }
};

export default eventApi;