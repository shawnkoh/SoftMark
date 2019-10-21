import { Router } from "express";
import * as MarksController from "../../controllers/MarksController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/:id/marks", MarksController.create);

export default router;
