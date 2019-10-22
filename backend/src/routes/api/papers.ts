import { Router } from "express";
import * as PapersController from "../../controllers/PapersController";
import * as PaperUsersController from "../../controllers/PaperUsersController";
import * as ScriptTemplatesController from "../../controllers/ScriptTemplatesController";
import * as ScriptsController from "../../controllers/ScriptsController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/", PapersController.create);
router.get("/", PapersController.index);
router.get("/:id", PapersController.show);
router.patch("/:id", PapersController.update);
router.delete("/:id", PapersController.discard);
router.patch("/:id/undiscard", PapersController.undiscard);

router.post("/:id/users", PaperUsersController.create);

router.get("/:id/script_template", ScriptTemplatesController.show);
router.post("/:id/scripts", ScriptsController.create);
router.get("/:id/scripts", ScriptsController.index);

export default router;
