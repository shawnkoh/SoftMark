import { getRepository, IsNull } from "typeorm";
import { Bookmark } from "../entities/Bookmark";
import { Mark } from "../entities/Mark";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";

// Permission for user to create new bookmark
export const allowedToCreateNewBookmark = async (
  userId: number,
  paperUserId: number,
  questionId: number
): Promise<false | { mark: Mark }> => {
  const user = await getRepository(User).findOneOrFail(userId, {
    where: { discardedAt: IsNull() }
  });
  const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId, {
    where: { discardedAt: IsNull() }
  });

  if (!paperUser || paperUser.user !== user) {
    return false;
  }

  const mark = await getRepository(Mark).findOneOrFail({
    paperUserId,
    questionId,
    discardedAt: IsNull()
  });

  return { mark };
};

// Permission for user to adjust existing bookmark information
export const allowedBookmarker = async (
  userId: number,
  bookmarkId: number
): Promise<false | { paperUser: PaperUser }> => {
  const user = await getRepository(User).findOneOrFail(userId, {
    where: { discardedAt: IsNull() }
  });
  const bookmark = await getRepository(Bookmark).findOneOrFail(bookmarkId);
  const paperUser = bookmark.paperUser;

  if (!paperUser || paperUser.user !== user) {
    return false;
  }

  return { paperUser };
};
