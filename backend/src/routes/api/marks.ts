import { Router } from "express";
import * as MarksController from "../../controllers/MarksController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.patch("/:id", MarksController.update);
router.delete("/:id", MarksController.discard);
router.patch("/:id/undiscard", MarksController.undiscard);

export default router;
