import api from "../configs/axiosConfig";

// Wallet statement report: JSON for the screen and CSV for download.
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
