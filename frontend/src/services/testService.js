// src/services/testService.js
import { testApi, storageApi } from "./api";

export const testService = {
  getAllTests: async () => {
    const response = await testApi.get("/api/tests/available");
    return response.data;
  },

  getAvailableSubjects: async () => {
    const response = await storageApi.get("/api/storage/subjects");
    return response.data;
  },

  getSubjectTest: async (subject) => {
    const response = await storageApi.get(`/api/storage/test/${subject}`);
    return response.data;
  },

  validateSubjectAnswers: async (subject, answers) => {
    const response = await storageApi.post(`/api/storage/validate/${subject}`, {
      answers,
    });
    return response.data;
  },

  getTestResult: async (resultId) => {
    const response = await testApi.get(`/api/tests/result/${resultId}`);
    return response.data;
  },

  getActiveTest: async (testId) => {
    try {
      const response = await testApi.get(`/api/tests/active/${testId}`);
      return {
        activeTest: {
          testId: response.data.testId,
          subject: response.data.subject,
          remainingTime: response.data.remainingTime,
          testTitle: response.data.subject + " Testi",
        },
        questions: response.data.questions,
        answers: response.data.answers,
      };
    } catch (error) {
      console.error("Aktif test alınırken hata oluştu:", error);
      throw error;
    }
  },

  startTest: async (sinif, ders, konu) => {
    const response = await testApi.post(
      `/api/tests/start/${sinif}/${ders}/${konu}`
    );
    return response.data;
  },

  saveAnswer: async (testId, questionId, answer) => {
    try {
      await testApi.post(`/api/tests/answer/${testId}`, {
        questionId,
        answer: answer === null ? "" : answer,
      });
    } catch (error) {
      console.error("Cevap kaydedilemedi:", error);
      throw error;
    }
  },

  submitTest: async (testId, answers) => {
    try {
      const response = await testApi.post(`/api/tests/complete/${testId}`, {
        answers,
      });
      return response.data;
    } catch (error) {
      console.error("Test gönderilirken hata oluştu:", error);
      throw error;
    }
  },

  getTestImage: async (imagePath) => {
    const response = await storageApi.get(`/api/storage/image/${imagePath}`, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  },

  getImageUrlPath: (imageUrl) => {
    // storageApi'nin baseURL'ini alalım
    const baseUrl = storageApi.defaults.baseURL;
    return `${baseUrl}${imageUrl}`;
  },

  getTestHistory: async () => {
    const response = await testApi.get("/api/tests/history");
    return response.data;
  },

  getClasses: async () => {
    const response = await storageApi.get("/api/storage/classes");
    return response.data;
  },
  getCourses: async (sinif) => {
    const response = await storageApi.get(
      `/api/storage/classes/${sinif}/dersler`
    );
    return response.data;
  },
  getTopics: async (sinif, ders) => {
    const response = await storageApi.get(
      `/api/storage/classes/${sinif}/dersler/${ders}/konular`
    );
    return response.data;
  },
  getTopicTest: async (sinif, ders, konu) => {
    const response = await storageApi.get(
      `/api/storage/test/${sinif}/${ders}/${konu}`
    );
    return response.data;
  },

  searchTests: async (searchTerm) => {
    const response = await testApi.get(
      `/api/tests/search?term=${encodeURIComponent(searchTerm)}`
    );
    return response.data;
  },

  getRecentTests: async (userId) => {
    const response = await testApi.get(`/api/tests/recent/${userId}`);
    return response.data;
  },

  getRecommendedTests: async (userId) => {
    const response = await testApi.get(`/api/tests/recommended/${userId}`);
    return response.data;
  },
};
