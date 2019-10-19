import { Router } from "express";
import * as AuthController from "../../controllers/AuthController";

export const router = Router();

router.post("/passwordless", AuthController.passwordless);
router.post("/token", AuthController.token);

export default router;
