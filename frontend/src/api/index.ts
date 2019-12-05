import * as allocations from "./allocations";
import * as annotations from "./annotations";
import * as auth from "./auth";
import * as marks from "./marks";
import * as papers from "./papers";
import * as paperUsers from "./paperUsers";
import * as questionTemplates from "./questionTemplates";
import * as scripts from "./scripts";
import * as scriptTemplates from "./scriptTemplates";
import * as students from "./students";
import * as users from "./users";

const api = {
  allocations,
  annotations,
  auth,
  marks,
  papers,
  paperUsers,
  questionTemplates,
  scripts,
  scriptTemplates,
  students,
  users
};

Object.freeze(api);

export default api;
