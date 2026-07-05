import axios from 'axios';
import { Platform } from 'react-native';

// On Web: use the window location hostname to prevent issues if hosted on a different device
// On Android emulator: 10.0.2.2 is the loopback interface to host computer
// On iOS simulator/others: localhost
let baseURL = 'http://localhost:5000/api';

if (Platform.OS === 'android') {
  baseURL = 'http://10.0.2.2:5000/api';
} else if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  baseURL = `http://${hostname}:5000/api`;
}

const api = axios.create({
  baseURL,
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    try {
      if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error fetching token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
