import api from "../configs/axiosConfig";

class BaseService {
  constructor(endPoint) {
    this.endPoint = endPoint;
    this.api = api;
  }

  async insert(data) {
    const response = await this.api.post(this.endPoint, data);
    return response;
  }

  async update(dados) {
    const response = await this.api.put(this.endPoint, dados);
    return response;
  }

  async delete(id) {
    const response = await this.api.delete(`${this.endPoint}/${id}`);
    return response;
  }

  async listAll() {
    const response = await this.api.get(this.endPoint);
    return response;
  }
}

export default BaseService;
