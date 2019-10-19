import { Router } from "express";
import * as PaperUsersController from "../../controllers/PaperUsersController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/papers/:id", PaperUsersController.create);
router.patch("/:id", PaperUsersController.update);
router.delete(":id", PaperUsersController.discard);
router.patch("/:id", PaperUsersController.undiscard);

export default router;
