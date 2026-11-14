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

  async updateProfile(name) {
    const response = await api.put("/api/v1/users/me", { name });
    return response.data;
  }

  async updateAvatar(avatar) {
    const response = await api.put("/api/v1/users/me/avatar", { avatar });
    return response.data;
  }

  async removeAvatar() {
    const response = await api.delete("/api/v1/users/me/avatar");
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
