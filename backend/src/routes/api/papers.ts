import { Router } from "express";
import * as PapersController from "../../controllers/PapersController";
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

export default router;
