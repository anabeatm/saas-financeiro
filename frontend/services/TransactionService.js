import api from "../configs/axiosConfig";

class TransactionService {
  async list(walletId, params = {}) {
    const response = await api.get(`/api/v1/wallets/${walletId}/transactions`, {
      params,
    });
    return response.data;
  }

  async create(walletId, transaction) {
    const response = await api.post(
      `/api/v1/wallets/${walletId}/transactions`,
      transaction,
    );
    return response.data;
  }

  async update(walletId, transactionId, transaction) {
    const response = await api.put(
      `/api/v1/wallets/${walletId}/transactions/${transactionId}`,
      transaction,
    );
    return response.data;
  }

  async remove(walletId, transactionId) {
    await api.delete(`/api/v1/wallets/${walletId}/transactions/${transactionId}`);
  }
}

export default TransactionService;
