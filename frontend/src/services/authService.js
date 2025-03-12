import { authApi } from './api';

export const authService = {
  login: async (credentials) => {
    try {
      // console.log('Login isteği gönderiliyor:', credentials);
      const response = await authApi.post('/api/auth/login', credentials);
      // console.log('Login yanıtı:', response.data);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login hatası:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('Kayıt isteği gönderiliyor:', userData);
      const response = await authApi.post('/api/auth/register', userData);
      console.log('Kayıt yanıtı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};