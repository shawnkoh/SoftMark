import { Router } from "express";
import * as AllocationsController from "../../controllers/AllocationsController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.delete("/:id", AllocationsController.destroy);

export default router;
