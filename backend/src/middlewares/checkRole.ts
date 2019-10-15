import { Request, Response, NextFunction } from "express";
import { AccessTokenSignedPayload } from "../types/tokens";
import { UserRole } from "../types/users";

export const checkRole = (roles: Array<UserRole>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const payload = res.locals.payload as AccessTokenSignedPayload;
    const userRole = payload.role;

    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403).send();
    }
  };
};
