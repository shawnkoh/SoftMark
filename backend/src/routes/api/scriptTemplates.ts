import { Router } from "express";
import * as QuestionTemplatesController from "../../controllers/QuestionTemplatesController";
import * as ScriptTemplatesController from "../../controllers/ScriptTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.delete("/:id", ScriptTemplatesController.discard);
router.patch("/:id/undiscard", ScriptTemplatesController.undiscard);

router.post("/:id/question_templates", QuestionTemplatesController.create);

router.get(
  "/:id/root_question_templates",
  QuestionTemplatesController.rootQuestionTemplates
);

export default router;
