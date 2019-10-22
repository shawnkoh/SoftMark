import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { getRepository, IsNull, Not } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { PaperUser } from "../entities/PaperUser";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { AccessTokenSignedPayload } from "../types/tokens";
import { AllocationPostData } from "../types/allocations";
import { PaperUserRole } from "../types/paperUsers";
import { allowedPaperUser } from "../utils/papers";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const questionTemplateId = Number(request.params.id);
    const postData: AllocationPostData = request.body;
    const { paperUserId, totalAllocated } = postData;
    const paperUser = await getRepository(PaperUser).findOneOrFail(
      paperUserId,
      { where: { discardedAt: IsNull() } }
    );
    const allowed = await allowedPaperUser(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    const allocation = new Allocation();
    allocation.questionTemplate = await getRepository(
      QuestionTemplate
    ).findOneOrFail(questionTemplateId, { where: { discardedAt: IsNull() } });
    allocation.paperUser = paperUser;
    allocation.totalAllocated = totalAllocated;
    await validateOrReject(allocation);
    await getRepository(Allocation).save(allocation);

    const data = await allocation.getData();
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
    const allocationId = Number(request.params.id);
    const allocation = await getRepository(Allocation).findOneOrFail(
      allocationId
    );
    const paperUser = await getRepository(PaperUser).findOneOrFail(
      allocation.paperUserId,
      { where: { discardedAt: IsNull() } }
    );
    const allowed = await allowedPaperUser(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(Allocation).delete(allocationId);
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
