import { Router } from "express";
import papers from "./papers";
import users from "./users";
import * as TokensController from "../../controllers/TokensController";

const routes = Router();

routes.use("/papers", papers);
routes.use("/users", users);

routes.post("/login", TokensController.login);

export default routes;
