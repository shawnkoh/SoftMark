import { Router } from "express";

import * as AllocationsController from "../../controllers/AllocationsController";
import * as QuestionTemplatesController from "../../controllers/QuestionTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.get("/:id", QuestionTemplatesController.show);
router.patch("/:id", QuestionTemplatesController.update);
router.delete("/:id", QuestionTemplatesController.discard);
router.patch("/:id/undiscard", QuestionTemplatesController.undiscard);

router.post("/:id/allocation", AllocationsController.create);

export default router;
