import { Router } from "express";

import * as BookmarksController from "../../controllers/BookmarksController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.delete("/:id", BookmarksController.destroy);

export default router;
