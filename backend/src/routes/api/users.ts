import { Router } from "express";
import * as UsersController from "../../controllers/UsersController";
import { checkBearerToken } from "../../middlewares/checkBearerToken";
import { BearerTokenType } from "../../types/tokens";

export const router = Router();

router.post("/", UsersController.create);

router.use(checkBearerToken(BearerTokenType.AccessToken));
router.get("/self", UsersController.showSelf);
router.patch("/self", UsersController.updateSelf);
router.patch("/change_password", UsersController.changePassword);

export default router;
