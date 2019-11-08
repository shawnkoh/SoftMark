import * as annotations from "./annotations";
import * as auth from "./auth";
import * as paperUsers from "./paperUsers";
import * as papers from "./papers";
import * as scriptTemplates from "./scriptTemplates";
import * as scripts from "./scripts";
import * as questionTemplates from "./questionTemplates";
import * as users from "./users";

const api = {
  annotations,
  auth,
  paperUsers,
  papers,
  scriptTemplates,
  scripts,
  questionTemplates,
  users
};

Object.freeze(api);

export default api;
