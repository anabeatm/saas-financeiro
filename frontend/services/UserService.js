import BaseService from "./BaseService";

// para registro e alteração de senha

class UserService extends BaseService {
  constructor() {
    super("/api/user");
  }
}

export default UserService;
