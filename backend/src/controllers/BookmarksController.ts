import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { Bookmark } from "../entities/Bookmark";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import { AccessTokenSignedPayload } from "../types/tokens";
import { BookmarkPostData } from "../types/bookmarks";
import { allowedToCreateNewBookmark, allowedBookmarker } from "../utils/bookmarks";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const questionId = Number(request.params.id);
    const postData: BookmarkPostData = request.body;
    const { paperUserId } = postData;
    const allowed = allowedToCreateNewBookmark(userId, paperUserId, questionId);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    const paperUser = await getRepository(PaperUser).findOneOrFail(
      paperUserId,
      { where: { discardedAt: IsNull() } }
    );
    const question = await getRepository(Question).findOneOrFail(questionId, {
      where: { discardedAt: IsNull() }
    });

    const bookmark = new Bookmark();
    bookmark.paperUser = paperUser;
    bookmark.question = question;
    await validateOrReject(bookmark);

    const data = await bookmark.getData();
    response.status(201).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

// hard delete
export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const bookmarkId = Number(request.params.id);
    const allowed = await allowedBookmarker(userId, bookmarkId);
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Bookmark).delete(bookmarkId);

    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
