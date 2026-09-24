import api from "../configs/axiosConfig";

class TransactionService {
  async list(walletId, params = {}) {
    const response = await api.get(`/api/wallets/${walletId}/transactions`, {
      params,
    });
    return response.data;
  }

  async create(walletId, transaction) {
    const response = await api.post(
      `/api/wallets/${walletId}/transactions`,
      transaction,
    );
    return response.data;
  }

  async remove(walletId, transactionId) {
    await api.delete(`/api/wallets/${walletId}/transactions/${transactionId}`);
  }
}

export default TransactionService;
