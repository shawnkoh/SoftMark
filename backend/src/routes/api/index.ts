import { Router } from "express";
import allocations from "./allocations";
import auth from "./auth";
import bookmarks from "./bookmarks";
import marks from "./marks";
import papers from "./papers";
import paperUsers from "./paperUsers";
import questionTemplates from "./questionTemplates";
import questions from "./questions";
import scriptTemplates from "./scriptTemplates";
import scripts from "./scripts";
import users from "./users";

const routes = Router();

routes.use("/allocations", allocations);
routes.use("/auth", auth);
routes.use("/bookmarks", bookmarks);
routes.use("/marks", marks);
routes.use("/papers", papers);
routes.use("/paper_users", paperUsers);
routes.use("/questions", questions);
routes.use("/question_templates", questionTemplates);
routes.use("/scripts", scripts);
routes.use("/script_templates", scriptTemplates);
routes.use("/users", users);

export default routes;
