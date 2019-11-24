import { Router } from "express";
import * as AllocationsController from "../../controllers/AllocationsController";
import * as QuestionTemplatesController from "../../controllers/QuestionTemplatesController";
import * as ViewController from "../../controllers/ViewController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.get("/:id", QuestionTemplatesController.show);
router.patch("/:id", QuestionTemplatesController.update);
router.delete("/:id", QuestionTemplatesController.discard);
router.patch("/:id/undiscard", QuestionTemplatesController.undiscard);

router.post("/:id/allocations", AllocationsController.create);

router.get("/:id/question_to_mark", ViewController.questionToMark);
router.get("/:id/next_script_to_mark", ViewController.nextScriptToMark);

export default router;
