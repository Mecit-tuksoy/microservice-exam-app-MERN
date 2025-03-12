import { testApi } from './api';

export const resultService = {
  getResultById: async (resultId) => {
    try {
      // Endpoint'i '/api/tests/result/:resultId' olarak düzelttik
      const response = await testApi.get(`/api/tests/result/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Sonuç alınırken hata oluştu:', error);
      throw error;
    }
  },

  getUserResults: async () => {
    try {
      const response = await testApi.get('/api/tests/history');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Sonuçlar alınamadı');
    }
  }
};