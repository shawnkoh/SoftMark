import { Router } from "express";
import * as AllocationsController from "../../controllers/AllocationsController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/:id/allocation", AllocationsController.create);

export default router;
