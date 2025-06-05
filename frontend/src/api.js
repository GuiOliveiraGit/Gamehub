import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // porta do backend
  withCredentials: true,
});

export default api;
