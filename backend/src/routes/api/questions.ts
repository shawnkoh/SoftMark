import { Router } from "express";
import * as BookmarksController from "../../controllers/BookmarksController";
import * as MarksController from "../../controllers/MarksController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.post("/:id/bookmarks", BookmarksController.create);
router.put("/:id/mark", MarksController.replace);

export default router;
