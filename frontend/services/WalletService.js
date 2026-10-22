import BaseService from "./BaseService";
import api from "../configs/axiosConfig";

class WalletService extends BaseService {
  constructor() {
    super("/api/v1/wallets");
  }

  async getById(id) {
    const response = await api.get(`/api/v1/wallets/${id}`);
    return response.data;
  }

  async create(wallet) {
    const response = await api.post("/api/v1/wallets", wallet);
    return response.data;
  }

  async update(id, wallet) {
    const response = await api.put(`/api/v1/wallets/${id}`, wallet);
    return response.data;
  }

  async remove(id) {
    await api.delete(`/api/v1/wallets/${id}`);
  }

  async list() {
    const response = await api.get("/api/v1/wallets");
    return response.data;
  }
}

export default WalletService;
