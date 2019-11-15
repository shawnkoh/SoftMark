import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperData } from "../types/papers";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const paper = new Paper(request.body.name);
  const paperErrors = await validate(paper);
  if (paperErrors.length > 0) {
    response.sendStatus(400);
    return;
  }

  const paperUser = new PaperUser(paper, requesterUserId, PaperUserRole.Owner);
  const paperUserErrors = await validate(paperUser);
  if (paperUserErrors.length > 0) {
    response.sendStatus(400);
    return;
  }

  await getRepository(Paper).save(paper);
  await getRepository(PaperUser).save(paperUser);

  const data = await paper.getData(paperUser.role);
  response.status(201).json({ paper: data });
}

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperUsers = await getRepository(PaperUser).find({
    relations: ["paper"],
    where: { userId: payload.userId }
  });

  const data = paperUsers
    .map(paperUser => paperUser.paper!.getListData(paperUser.role))
    .filter(paperUserListData => !paperUserListData.discardedAt);
  response.status(200).json({ paper: data });
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const allowed = await allowedRequester(
    payload.userId,
    request.params.id,
    PaperUserRole.Student
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  let data: PaperData;
  // TODO: Student check is not tested - waiting for paperUser
  if (requester.role === PaperUserRole.Student) {
    data = {
      ...paper.getListData(requester.role),
      paperUsers: [await requester.getListData()]
    };
  } else {
    data = await paper.getData(requester.role);
  }
  response.status(200).json({ paper: data });
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const allowed = await allowedRequester(
    payload.userId,
    Number(request.params.id),
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  paper.name = request.body.name;
  const errors = await validate(paper);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Paper).save(paper);

  const data = await paper.getData(requester.role);
  response.status(200).json({ paper: data });
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  const allowed = await allowedRequester(
    payload.userId,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  await getRepository(Paper).update(paperId, {
    discardedAt: new Date()
  });
  response.sendStatus(204);
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  const allowed = await allowedRequester(
    payload.userId,
    Number(request.params.id),
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  await getRepository(Paper).update(paperId, {
    discardedAt: undefined
  });

  const data = await paper.getData(requester.role);
  response.status(200).json({ paper: data });
}
