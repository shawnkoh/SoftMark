import { Router } from "express";
import * as MarksController from "../../controllers/MarksController";
import { canModifyMark } from "../../middlewares/canModifyMark";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.delete("/:id", canModifyMark, MarksController.discard);
router.patch("/:id/undiscard", canModifyMark, MarksController.undiscard);

export default router;
