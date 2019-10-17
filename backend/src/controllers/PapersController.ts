import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperListData, PaperData } from "../types/papers";
import { PaperUserRole } from "../types/paperUsers";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const user = await getRepository(User).findOneOrFail(payload.id);

    const paper = new Paper();
    paper.name = request.body.name;
    await validateOrReject(paper);

    const paperUser = new PaperUser();
    paperUser.paper = paper;
    paperUser.user = user;
    paperUser.role = PaperUserRole.Owner;
    await validateOrReject(paperUser);

    await getRepository(Paper).save(paper);
    await getRepository(PaperUser).save(paperUser);

    delete paperUser.paper;
    delete paperUser.user;
    const data: PaperData = {
      ...paper,
      role: paperUser.role,
      paperUsers: [paperUser]
    };
    response.status(201).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function index(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paperUsers = await getRepository(PaperUser).find({
      relations: ["paper"],
      where: { user: payload.id }
    });

    const data: PaperListData[] = paperUsers.map(paperUser => ({
      ...paperUser.paper,
      role: paperUser.role
    }));
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function show(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paper = await getRepository(Paper).findOneOrFail(request.params.id, {
      relations: ["paperUsers", "paperUsers.user"]
    });
    const paperUser = paper.paperUsers.find(
      paperUser => paperUser.user.id === payload.id
    );
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }

    delete paperUser.user;
    const data: PaperData = {
      ...paper,
      role: paperUser.role
    };
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function update(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paper = await getRepository(Paper).findOneOrFail(request.params.id, {
      relations: ["paperUsers", "paperUsers.user"]
    });
    const paperUser = paper.paperUsers.find(
      paperUser => paperUser.user.id === payload.id
    );
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    if (paperUser.role !== PaperUserRole.Owner) {
      response.sendStatus(403);
      return;
    }

    paper.name = request.body.name;
    await validateOrReject(paper);
    await getRepository(Paper).save(paper);

    delete paperUser.user;
    const data: PaperData = {
      ...paper,
      role: paperUser.role
    }
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paper = await getRepository(Paper).findOneOrFail(request.params.id, {
      relations: ["paperUsers", "paperUsers.user"]
    });
    const paperUser = paper.paperUsers.find(
      paperUser => paperUser.user.id === payload.id
    );
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    if (paperUser.role !== PaperUserRole.Owner) {
      response.sendStatus(403);
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
    const paper = await getRepository(Paper).findOneOrFail(request.params.id, {
      relations: ["paperUsers", "paperUsers.user"]
    });
    const paperUser = paper.paperUsers.find(
      paperUser => paperUser.user.id === payload.id
    );
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    if (paperUser.role !== PaperUserRole.Owner) {
      response.sendStatus(403);
      return;
    }

    await getRepository(Paper).update(request.params.id, {
      discardedAt: undefined
    });

    delete paperUser.user;
    const data: PaperData = {
      ...paper,
      role: paperUser.role
    }
    response.status(200).json(data);
  } catch (error) {
    response.sendStatus(400);
  }
}
