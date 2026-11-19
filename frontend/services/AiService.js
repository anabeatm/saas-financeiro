import api from "../configs/axiosConfig";

// requests de ia
class AiService {
  // sugere uma categoria pela descrição
  async suggestCategory(description, type) {
    const response = await api.post("/api/v1/ai/category-suggestion", {
      description,
      type,
    });
    return response.data;
  }

  // resumo e dicas do período
  async getInsights(walletId, startDate, endDate) {
    const response = await api.get(
      `/api/v1/wallets/${walletId}/reports/insights`,
      { params: { startDate, endDate } },
    );
    return response.data;
  }
}

export default AiService;
