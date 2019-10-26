import { Router } from "express";
import * as PageTemplatesController from "../../controllers/PageTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.get("/:id", PageTemplatesController.show);

export default router;
