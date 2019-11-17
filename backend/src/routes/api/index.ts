import { Router } from "express";
import allocations from "./allocations";
import annotations from "./annotations";
import auth from "./auth";
import bookmarks from "./bookmarks";
import marks from "./marks";
import pageQuestionTemplates from "./pageQuestionTemplates";
import pages from "./pages";
import pageTemplates from "./pageTemplates";
import papers from "./papers";
import paperUsers from "./paperUsers";
import questions from "./questions";
import questionTemplates from "./questionTemplates";
import scripts from "./scripts";
import scriptTemplates from "./scriptTemplates";
import users from "./users";

const routes = Router();

routes.use("/allocations", allocations);
routes.use("/annotations", annotations);
routes.use("/auth", auth);
routes.use("/bookmarks", bookmarks);
routes.use("/marks", marks);
routes.use("/page_question_templates", pageQuestionTemplates);
routes.use("/page_templates", pageTemplates);
routes.use("/pages", pages);
routes.use("/paper_users", paperUsers);
routes.use("/papers", papers);
routes.use("/question_templates", questionTemplates);
routes.use("/questions", questions);
routes.use("/script_templates", scriptTemplates);
routes.use("/scripts", scripts);
routes.use("/users", users);

export default routes;
