import { Router } from "express";
import allocations from "./allocations";
import auth from "./auth";
import marks from "./marks";
import papers from "./papers";
import paperUsers from "./paperUsers";
import questions from "./questions";
import questionTemplates from "./questionTemplates";
import scriptTemplates from "./scriptTemplates";
import users from "./users";

const routes = Router();

routes.use("/allocations", allocations);
routes.use("/auth", auth);
routes.use("/marks", marks);
routes.use("/papers", papers);
routes.use("/paper_users", paperUsers);
routes.use("/questions", questions);
routes.use("/question_templates", questionTemplates);
routes.use("/users", users);
routes.use("/script_templates", scriptTemplates);

export default routes;
