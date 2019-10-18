import { Router } from "express";
import papers from "./papers";
import scriptTemplates from "./scriptTemplates";
import users from "./users";
import * as TokensController from "../../controllers/TokensController";

const routes = Router();

routes.use("/papers", papers);
routes.use("/users", users);
routes.use("/script_templates", scriptTemplates);

routes.post("/login", TokensController.login);

export default routes;
