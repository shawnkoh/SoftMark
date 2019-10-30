import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";

export function allowedRole(role: PaperUserRole, requiredRole: PaperUserRole) {
  return (
    role === PaperUserRole.Owner ||
    requiredRole === PaperUserRole.Student ||
    (requiredRole === PaperUserRole.Marker && role === PaperUserRole.Marker)
  );
}

export const allowedRequester = async (
  userId: number,
  paperId: number | string,
  requiredRole: PaperUserRole
): Promise<false | { paper: Paper; requester: PaperUser }> => {
  const paper = await getRepository(Paper).findOne(paperId, {
    relations: ["paperUsers"]
  });
  if (!paper) {
    return false;
  }
  const requester = paper.paperUsers!.find(
    paperUser => paperUser.userId === userId && !paperUser.discardedAt
  );
  if (!requester || !allowedRole(requester.role, requiredRole)) {
    return false;
  }
  return { paper, requester };
};

export const allowedRequesterOrFail = async (
  userId: number,
  paperId: number | string,
  requiredRole: PaperUserRole
): Promise<{ paper: Paper; requester: PaperUser }> => {
  const allowed = await allowedRequester(userId, paperId, requiredRole);
  if (!allowed) {
    throw new Error("User is not allowed to access this resource");
  }
  return allowed;
};
