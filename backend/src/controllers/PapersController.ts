import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserRole } from "../types/paperUsers";

const check = async (
  userId: number,
  paperId: number,
  role?: PaperUserRole
): Promise<false | { paper: Paper; paperUser: PaperUser }> => {
  const paper = await getRepository(Paper).findOneOrFail(paperId);
  const paperUsers = await paper.paperUsers;
  const paperUser = paperUsers.find(paperUser => paperUser.userId === userId);
  if (!paperUser) {
    return false;
  }

  if (!role || role === PaperUserRole.Student) {
    return { paper, paperUser };
  }
  if (
    (role === PaperUserRole.Marker &&
      paperUser.role === PaperUserRole.Student) ||
    (role === PaperUserRole.Owner && paperUser.role !== PaperUserRole.Owner)
  ) {
    return false;
  }
  return { paper, paperUser };
};

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;

    const paper = new Paper();
    paper.name = request.body.name;
    await validateOrReject(paper);

    const paperUser = new PaperUser();
    paperUser.paper = paper;
    paperUser.userId = payload.id;
    paperUser.role = PaperUserRole.Owner;
    await validateOrReject(paperUser);

    await getRepository(Paper).save(paper);
    await getRepository(PaperUser).save(paperUser);

    const data = await paper.getData(paperUser.role);
    response.status(201).json(data);
  } catch (error) {
    console.error(error);
    response.sendStatus(400);
  }
}

export async function index(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paperUsers = await getRepository(PaperUser).find({
      relations: ["paper"],
      where: { userId: payload.id }
    });

    const data = paperUsers.map(paperUser =>
      paperUser.paper.getListData(paperUser.role)
    );
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function show(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await check(payload.id, Number(request.params.id));
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper, paperUser } = allowed;

    const data = await paper.getData(paperUser!.role);
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await check(
      payload.id,
      Number(request.params.id),
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper, paperUser } = allowed;

    paper.name = request.body.name;
    await validateOrReject(paper);
    await getRepository(Paper).save(paper);

    const data = await paper.getData(paperUser.role);
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await check(
      payload.id,
      Number(request.params.id),
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Paper).update(request.params.id, {
      discardedAt: new Date()
    });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function undiscard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await check(
      payload.id,
      Number(request.params.id),
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper, paperUser } = allowed;

    await getRepository(Paper).update(request.params.id, {
      discardedAt: undefined
    });

    const data = await paper.getData(paperUser.role);
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
