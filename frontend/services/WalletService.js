import BaseService from "./BaseService";
import api from "../configs/axiosConfig";

class WalletService extends BaseService {
  constructor() {
    super("/api/wallets");
  }

  async getById(id) {
    const response = await api.get(`/api/wallets/${id}`);
    return response.data;
  }

  async create(wallet) {
    const response = await api.post("/api/wallets", wallet);
    return response.data;
  }

  async update(id, wallet) {
    const response = await api.put(`/api/wallets/${id}`, wallet);
    return response.data;
  }

  async remove(id) {
    await api.delete(`/api/wallets/${id}`);
  }

  async list() {
    const response = await api.get("/api/wallets");
    return response.data;
  }
}

export default WalletService;
