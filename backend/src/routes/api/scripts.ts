import { Router } from "express";
import * as ScriptsController from "../../controllers/ScriptsController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.get("/:id", ScriptsController.show);
router.delete("/:id", ScriptsController.discard);
router.patch("/:id/undiscard", ScriptsController.undiscard);
router.patch("/:id", ScriptsController.update);

export default router;
