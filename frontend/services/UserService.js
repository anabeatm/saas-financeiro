import api from "../configs/axiosConfig";
import BaseService from "./BaseService";

// para registro e alteração de senha

class UserService extends BaseService {
  constructor() {
    super("/api/user");
  }

  async getMe() {
    const response = await api.get("/api/user/me");
    return response.data;
  }
}

export default UserService;
