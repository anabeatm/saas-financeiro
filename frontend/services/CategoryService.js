import BaseService from "./BaseService";
import api from "../configs/axiosConfig";

class CategoryService extends BaseService {
  constructor() {
    super("/api/categories");
  }

  async list(type) {
    const response = await api.get("/api/categories", {
      params: type ? { type } : {},
    });
    return response.data;
  }

  async create(category) {
    const response = await api.post("/api/categories", category);
    return response.data;
  }

  async update(id, category) {
    const response = await api.put(`/api/categories/${id}`, category);
    return response.data;
  }

  async remove(id) {
    await api.delete(`/api/categories/${id}`);
  }
}

export default CategoryService;
