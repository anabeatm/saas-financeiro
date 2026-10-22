import api from "../configs/axiosConfig";
import BaseService from "./BaseService";

// Handles user profile and password requests.

class UserService extends BaseService {
  constructor() {
    super("/api/v1/users");
  }

  async getMe() {
    const response = await api.get("/api/v1/users/me");
    return response.data;
  }

  async changePassword(oldPassword, newPassword) {
    const response = await api.patch("/api/v1/users/me/password", {
      oldPassword: oldPassword,
      newPassword: newPassword,
    });
    return response.data;
  }
}

export default UserService;
