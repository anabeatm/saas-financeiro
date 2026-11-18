import api from "../configs/axiosConfig";

// AI features (Google Gemini on the backend).
class AiService {
  // Picks one of the user's categories for a transaction description; categoryId is null when none fits.
  async suggestCategory(description, type) {
    const response = await api.post("/api/v1/ai/category-suggestion", {
      description,
      type,
    });
    return response.data;
  }

  // Short natural-language summary and tips for a wallet's period.
  async getInsights(walletId, startDate, endDate) {
    const response = await api.get(
      `/api/v1/wallets/${walletId}/reports/insights`,
      { params: { startDate, endDate } },
    );
    return response.data;
  }
}

export default AiService;
