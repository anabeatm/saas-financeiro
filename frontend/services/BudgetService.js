import api from "../configs/axiosConfig";

// Monthly spending limits per expense category.
class BudgetService {
  // month: "yyyy-MM" (current month when omitted)
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
