import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserRole } from "../types/paperUsers";

export async function create(request: Request, response: Response) {
  try {
    const accessTokenSignedPayload = response.locals
      .payload as AccessTokenSignedPayload;
    const user = await getRepository(User).findOneOrFail(
      accessTokenSignedPayload.id
    );

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

    response.status(201).json(paper);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function index(request: Request, response: Response) {
  try {
    // TODO: filter by permissions
    const papers = await getRepository(Paper).find();
    response.status(200).json(papers);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function update(request: Request, response: Response) {}

export async function show(request: Request, response: Response) {
  try {
    const paper = await getRepository(Paper).findOneOrFail(request.params.id);
    response.status(200).json(paper);
  } catch (error) {
    response.sendStatus(400);
    return;
  }
}

export async function discard(request: Request, response: Response) {
  try {
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
    await getRepository(Paper).update(request.params.id, {
      discardedAt: undefined
    });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
