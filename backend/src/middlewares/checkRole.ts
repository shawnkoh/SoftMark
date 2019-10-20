import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserRole } from "../types/paperUsers";

// TODO: Temporarily deprecated
export const checkPaperUserRole = (role: PaperUserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = res.locals.payload as AccessTokenSignedPayload;
    const user = await getRepository(User).findOneOrFail({
      relations: ["paperUsers", "paperUsers.paper"],
      where: { id: payload.id }
    });

    const papers = {};
    user.paperUsers.forEach(paperUser => {
      console.log(paperUser);
      paperUser.paper.id;
    });

    // if (roles.includes(userRole)) {
    if (true) {
      next();
    } else {
      res.status(403).send();
    }
  };
};
