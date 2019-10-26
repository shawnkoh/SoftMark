import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";
import { PaperData } from "../types/papers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedPaperUser } from "../utils/papers";

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
    response.status(201).json({ paper: data });
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
      paperUser.paper!.getListData(paperUser.role)
    );
    response.status(200).json({ paper: data });
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function show(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await allowedPaperUser(
      payload.id,
      Number(request.params.id)
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper, paperUser } = allowed;

    let data: PaperData;
    // TODO: Student check is not tested - waiting for paperUser
    if (paperUser.role === PaperUserRole.Student) {
      data = {
        ...paper.getListData(paperUser.role),
        paperUsers: [await paperUser.getListData()]
      };
    } else {
      data = await paper.getData(paperUser.role);
    }
    response.status(200).json({ paper: data });
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await allowedPaperUser(
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
    response.status(200).json({ paper: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const allowed = await allowedPaperUser(
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
    const allowed = await allowedPaperUser(
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
    response.status(200).json({ paper: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
