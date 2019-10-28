import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";

import { Allocation } from "../entities/Allocation";
import { PaperUser } from "../entities/PaperUser";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { AccessTokenSignedPayload } from "../types/tokens";
import { AllocationPostData } from "../types/allocations";
import { PaperUserRole } from "../types/paperUsers";
import { allowedRequesterOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const questionTemplateId = Number(request.params.id);
  const postData: AllocationPostData = pick(request.body, "paperUserId");
  try {
    const questionTemplate = await getRepository(
      QuestionTemplate
    ).findOneOrFail(questionTemplateId, {
      where: { discardedAt: IsNull() },
      relations: ["scriptTemplate"]
    });
    await allowedRequesterOrFail(
      userId,
      questionTemplate.scriptTemplate!.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const paperUserId = postData.paperUserId;
    const paperUser = await getRepository(PaperUser).findOneOrFail(
      paperUserId,
      { where: { discardedAt: IsNull() } }
    );
    const questionTemplate = await getRepository(
      QuestionTemplate
    ).findOneOrFail(questionTemplateId, { where: { discardedAt: IsNull() } });

    const allocation = new Allocation();
    allocation.paperUser = paperUser;
    allocation.questionTemplate = questionTemplate;
    await validateOrReject(allocation);
    await getRepository(Allocation).save(allocation);

    const data = await allocation.getData();
    response.status(201).json({ allocation: data });
  } catch (error) {
    console.error(error);
    response.sendStatus(400);
  }
}

// hard delete
export async function destroy(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const userId = payload.id;
  const allocationId = Number(request.params.id);
  try {
    const allocation = await getRepository(Allocation).findOneOrFail(
      allocationId,
      { relations: ["paperUser"] }
    );
    await allowedRequesterOrFail(
      userId,
      allocation.paperUser!.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    await getRepository(Allocation).delete(allocationId);
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
