import api from "../configs/axiosConfig";

// requests de orçamento
class BudgetService {
  // month: "yyyy-MM" (opcional)
  async list(month) {
    const response = await api.get("/api/v1/budgets", {
      params: month ? { month } : {},
    });
    return response.data;
  }

  async save(categoryId, monthlyLimit) {
    const response = await api.put(`/api/v1/budgets/${categoryId}`, {
      monthlyLimit,
    });
    return response.data;
  }

  async remove(categoryId) {
    await api.delete(`/api/v1/budgets/${categoryId}`);
  }
}

export default BudgetService;
