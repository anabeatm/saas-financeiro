import api from "../configs/axiosConfig";

// extrato (json e csv)
class ReportService {
  async getStatement(walletId, startDate, endDate) {
    const response = await api.get(
      `/api/v1/wallets/${walletId}/reports/statement`,
      { params: { startDate, endDate } },
    );
    return response.data;
  }

  async downloadStatementCsv(walletId, startDate, endDate) {
    const response = await api.get(
      `/api/v1/wallets/${walletId}/reports/statement/csv`,
      { params: { startDate, endDate }, responseType: "blob" },
    );
    return response.data;
  }
}

export default ReportService;
