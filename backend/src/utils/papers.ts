import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";

export const allowedPaperUser = async (
  userId: number,
  paperId: number | string,
  role?: PaperUserRole
): Promise<false | { paper: Paper; paperUser: PaperUser }> => {
  const paper = await getRepository(Paper).findOne(paperId, {
    relations: ["paperUsers"]
  });
  if (!paper) {
    return false;
  }
  const paperUser = paper.paperUsers!.find(
    paperUser => paperUser.userId === userId && !paperUser.discardedAt
  );
  if (
    !paperUser ||
    (role === PaperUserRole.Marker &&
      paperUser.role === PaperUserRole.Student) ||
    (role === PaperUserRole.Owner && paperUser.role !== PaperUserRole.Owner)
  ) {
    return false;
  }
  return { paper, paperUser };
};
