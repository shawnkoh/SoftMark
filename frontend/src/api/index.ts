import AnnotationsAPI from "./annotations";
import AuthAPI from "./auth";
import PapersAPI from "./papers";
import PaperUsersAPI from "./paperUsers";
import ScriptsAPI from "./scripts";
import ScriptTemplatesAPI from "./scriptTemplates";
import UsersAPI from "./users";

class API {
  annotations = new AnnotationsAPI();
  auth = new AuthAPI();
  papers = new PapersAPI();
  paperUsers = new PaperUsersAPI();
  scripts = new ScriptsAPI();
  scriptTemplates = new ScriptTemplatesAPI();
  users = new UsersAPI();

  setAuthorizationHeader(token: string) {
    this.annotations.setAuthorizationToken(token);
    this.auth.setAuthorizationToken(token);
    this.papers.setAuthorizationToken(token);
    this.paperUsers.setAuthorizationToken(token);
    this.scripts.setAuthorizationToken(token);
    this.scriptTemplates.setAuthorizationToken(token);
    this.users.setAuthorizationToken(token);
  }
}

const api = new API();

export default api;
