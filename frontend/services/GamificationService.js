import api from "../configs/axiosConfig";

// requests da gamificação
class GamificationService {
  async getMe() {
    const response = await api.get("/api/v1/gamification/me");
    return response.data;
  }

  // check-in de "não gastei nada hoje"
  async checkIn() {
    const response = await api.post("/api/v1/gamification/check-in");
    return response.data;
  }
}

export default GamificationService;
