import { Router } from "express";
import * as ScriptTemplatesController from "../../controllers/ScriptTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.patch("/script_templates/:id", ScriptTemplatesController.update);
router.delete("/script_templates/:id", ScriptTemplatesController.discard);
router.patch(
  "/script_templates/:id/undiscard",
  ScriptTemplatesController.undiscard
);

export default router;
