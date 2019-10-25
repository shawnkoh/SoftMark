import { Router } from "express";
import * as ScriptTemplatesController from "../../controllers/ScriptTemplatesController";
import * as QuestionTemplatesController from "../../controllers/QuestionTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.patch("/:id", ScriptTemplatesController.update);
router.delete("/:id", ScriptTemplatesController.discard);
router.patch("/:id/undiscard", ScriptTemplatesController.undiscard);

router.post("/:id/question_templates", QuestionTemplatesController.create);

export default router;
