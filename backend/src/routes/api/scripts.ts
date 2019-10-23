import { Router } from "express";
import * as PaperUsersController from "../../controllers/PaperUsersController";
import * as ScriptsController from "../../controllers/ScriptsController";
import * as ScriptTemplatesController from "../../controllers/ScriptTemplatesController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/", ScriptsController.create);
router.get("/", ScriptsController.index);
router.get("/:id", ScriptsController.show);
router.delete("/:id", ScriptsController.discard);
router.patch("/:id/undiscard", ScriptsController.undiscard);

export default router;
