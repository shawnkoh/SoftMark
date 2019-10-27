import { Router } from "express";

import * as PageQuestionTemplatesController from "../../controllers/PageQuestionTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.patch("/:id", PageQuestionTemplatesController.update);
router.delete("/:id", PageQuestionTemplatesController.discard);
router.patch("/:id/undiscard", PageQuestionTemplatesController.undiscard);

export default router;
