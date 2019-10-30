import { Router } from "express";
import * as AnnotationsController from "../../controllers/AnnotationsController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/:id/annotations", AnnotationsController.create);
router.get("/:id/annotations/self", AnnotationsController.show);

export default router;
