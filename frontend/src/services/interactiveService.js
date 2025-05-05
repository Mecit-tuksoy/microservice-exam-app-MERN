// src/services/interactiveService.js
import { storageApi } from "./api";

export const interactiveService = {
  // Tüm etkileşimli içerikleri getir
  getAllContents: async () => {
    try {
      const response = await storageApi.get("/api/storage/interactive-contents");
      return response.data.contents;
    } catch (error) {
      console.error("Etkileşimli içerikler yüklenirken hata:", error);
      throw error;
    }
  },

  // Belirli bir etkileşimli içeriğin bilgilerini getir
  getContentById: async (contentId) => {
    try {
      const allContents = await interactiveService.getAllContents();
      return allContents.find(content => content.id === contentId) || null;
    } catch (error) {
      console.error(`${contentId} içeriği yüklenirken hata:`, error);
      throw error;
    }
  }
};
