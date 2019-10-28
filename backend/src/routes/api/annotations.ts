import { Router } from "express";
import * as AnnotationsController from "../../controllers/AnnotationsController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.delete("/:id", AnnotationsController.destroy);

export default router;
