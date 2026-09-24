import api from "../configs/axiosConfig";

class WalletMemberService {
  async list(walletId) {
    const response = await api.get(`/api/wallets/${walletId}/members`);
    return response.data;
  }

  async add(walletId, member) {
    const response = await api.post(`/api/wallets/${walletId}/members`, member);
    return response.data;
  }

  async updateRole(walletId, userId, role) {
    const response = await api.patch(
      `/api/wallets/${walletId}/members/${userId}`,
      { role },
    );
    return response.data;
  }

  async remove(walletId, userId) {
    await api.delete(`/api/wallets/${walletId}/members/${userId}`);
  }
}

export default WalletMemberService;
