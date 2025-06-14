// src/services/analyticsService.js
import { analyticsApi } from "./api";

const analyticsService = {
  // Ziyaretçi sayısını artır
  incrementVisitor: async () => {
    try {
      const response = await analyticsApi.post("/visitor");
      return response.data;
    } catch (error) {
      console.error("Ziyaretçi artırma hatası:", error);
      throw error;
    }
  },

  // Ziyaretçi istatistiklerini getir
  getVisitorStats: async () => {
    try {
      const response = await analyticsApi.get("/visitors");
      return response.data;
    } catch (error) {
      console.error("Ziyaretçi istatistikleri getirme hatası:", error);
      throw error;
    }
  },
};

export default analyticsService;
