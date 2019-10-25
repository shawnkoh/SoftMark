import AuthAPI from "./auth";
import UsersAPI from "./users";

class API {
  auth = new AuthAPI();
  users = new UsersAPI();

  setAuthorizationHeader(token: string) {
    this.auth.setAuthorizationToken(token);
    this.users.setAuthorizationToken(token);
  }
}

const api = new API();

export default api;
