import AuthAPI from "./auth";
import PapersAPI from "./papers";
import PaperUsersAPI from "./paperUsers";
import UsersAPI from "./users";

class API {
  auth = new AuthAPI();
  papers = new PapersAPI();
  paperUsers = new PaperUsersAPI();
  users = new UsersAPI();

  setAuthorizationHeader(token: string) {
    this.auth.setAuthorizationToken(token);
    this.papers.setAuthorizationToken(token);
    this.paperUsers.setAuthorizationToken(token);
    this.users.setAuthorizationToken(token);
  }
}

const api = new API();

export default api;
