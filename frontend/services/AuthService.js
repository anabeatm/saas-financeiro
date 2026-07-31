// para login, recuperação de senha
import api from "../configs/axiosConfig";

class AuthService {
  async login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  }

  async register(user) {
    const response = await api.post("auth/register", user);
    return response.data;
  }

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(token, newPassword) {
    const response = await api.post("/auth/reset-password", {
      token: token,
      newPassword: newPassword,
    });
    return response.data;
  }

  async verifyAccount(token) {
    const response = await api.post("/auth/verify-account", { token });
    return response.data;
  }
}

export default new AuthService();
