import BaseService from "./BaseService";
import api from "../configs/axiosConfig";

class CategoryService extends BaseService {
  constructor() {
    super("/api/v1/categories");
  }

  async list(type) {
    const response = await api.get("/api/v1/categories", {
      params: type ? { type } : {},
    });
    return response.data;
  }

  async create(category) {
    const response = await api.post("/api/v1/categories", category);
    return response.data;
  }

  async update(id, category) {
    const response = await api.put(`/api/v1/categories/${id}`, category);
    return response.data;
  }

  async remove(id) {
    await api.delete(`/api/v1/categories/${id}`);
  }
}

export default CategoryService;
