import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { Bookmark } from "../entities/Bookmark";
import { PaperUser } from "../entities/PaperUser";
import { Question } from "../entities/Question";
import { AccessTokenSignedPayload } from "../types/tokens";
import { BookmarkPostData } from "../types/bookmarks";

export async function create(request: Request, response: Response) {
  try {
    // response.status(201).json({ bookmark: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

// hard delete
export async function destroy(request: Request, response: Response) {
  try {
  } catch (error) {
    response.sendStatus(400);
  }

  try {
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
