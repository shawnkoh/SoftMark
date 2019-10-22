import { getRepository, IsNull } from "typeorm";
import { Mark } from "../entities/Mark";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";

export const allowedMarker = async (
  userId: number,
  markId: number
): Promise<false | { paperUser: PaperUser }> => {
  const user = await getRepository(User).findOneOrFail(userId, {
    where: { discardedAt: IsNull() }
  });
  const mark = await getRepository(Mark).findOneOrFail(markId, {
    where: { discardedAt: IsNull() }
  });
  const paperUser = mark.paperUser;

  if (!paperUser || paperUser.user !== user) {
    return false;
  }

  return { paperUser };
};
