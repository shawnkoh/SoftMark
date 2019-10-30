import { Router } from "express";
import api from "./api";

const routes = Router();

routes.use("/softmark/v1", api);

export default routes;
