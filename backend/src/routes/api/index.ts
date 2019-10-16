import { Router } from "express";
import users from "./users";
import * as TokensController from "../../controllers/TokensController";

const routes = Router();

routes.use("/users", users);

routes.post("/login", TokensController.login);

export default routes;
