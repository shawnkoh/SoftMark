import { Router } from "express";

import allocations from "./allocations";
import auth from "./auth";
import bookmarks from "./bookmarks";
import marks from "./marks";
import papers from "./papers";
import pageTemplates from "./pageTemplates";
import pageQuestionTemplates from "./pageQuestionTemplates";
import paperUsers from "./paperUsers";
import questions from "./questions";
import questionTemplates from "./questionTemplates";
import scripts from "./scripts";
import scriptTemplates from "./scriptTemplates";
import users from "./users";

const routes = Router();

routes.use("/allocations", allocations);
routes.use("/auth", auth);
routes.use("/bookmarks", bookmarks);
routes.use("/marks", marks);
routes.use("/page_templates", pageTemplates);
routes.use("/paper_users", paperUsers);
routes.use("/papers", papers);
routes.use("/page_question_templates", pageQuestionTemplates);
routes.use("/question_templates", questionTemplates);
routes.use("/questions", questions);
routes.use("/script_templates", scriptTemplates);
routes.use("/scripts", scripts);
routes.use("/users", users);

export default routes;
