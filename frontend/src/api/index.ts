import * as annotations from "./annotations";
import * as auth from "./auth";
import * as paperUsers from "./paperUsers";
import * as papers from "./papers";
import * as scriptTemplates from "./scriptTemplates";
import * as scripts from "./scripts";
import * as users from "./users";

const api = {
  annotations,
  auth,
  paperUsers,
  papers,
  scriptTemplates,
  scripts,
  users
};

Object.freeze(api);

export default api;
