import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";

export const allowedToEditPaperUser = async (
  userId: number,
  paperUserId: number | string,
  canBeDiscarded?: boolean
): Promise<boolean> => {
  const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
  const paper = await getRepository(Paper).findOneOrFail(paperUser.paperId);
  const paperUserOfCurrentUser = await getRepository(PaperUser).findOneOrFail(
    {paper, userId}
  );
  const currentUserRole: PaperUserRole = paperUserOfCurrentUser.role;

  return currentUserRole == PaperUserRole.Owner && (canBeDiscarded || !paperUser.discardedAt);
};
