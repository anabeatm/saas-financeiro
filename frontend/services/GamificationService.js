import api from "../configs/axiosConfig";

// XP, level, streak and achievements of the signed-in user.
class GamificationService {
  async getMe() {
    const response = await api.get("/api/v1/gamification/me");
    return response.data;
  }

  // "I spent nothing today": keeps the streak on days without expenses (409 when not allowed).
  async checkIn() {
    const response = await api.post("/api/v1/gamification/check-in");
    return response.data;
  }
}

export default GamificationService;
