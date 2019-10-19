import { Router } from "express";
import auth from "./auth";
import papers from "./papers";
import paperUsers from "./paperUsers";
import scriptTemplates from "./scriptTemplates";
import users from "./users";

const routes = Router();

routes.use("/auth", auth);
routes.use("/papers", papers);
routes.use("/paper_users", paperUsers);
routes.use("/users", users);
routes.use("/script_templates", scriptTemplates);

export default routes;
