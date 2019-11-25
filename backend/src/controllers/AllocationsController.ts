import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { PaperUser } from "../entities/PaperUser";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { selectAllocationListData } from "../selectors/allocations";
import { AllocationPostData } from "../types/allocations";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";
import {
  getActiveAllocationsByPaperId,
  getActiveAllocationsByPaperUserId,
  getActiveRootAllocationsByPaperId
} from "../utils/queries";
import { sortAllocationsByQuestionNameThenPaperUserName } from "../utils/sorts";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
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

    const allocation = new Allocation(questionTemplate, paperUser);
    await validateOrReject(allocation);
    await getRepository(Allocation).save(allocation);

    const data = await allocation.getData();
    response.status(201).json({ allocation: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper } = allowed;

  const allocations = await getActiveAllocationsByPaperId(paperId);

  const data = await Promise.all(
    allocations.map(allocation => allocation.getListData())
  );
  response.status(200).json({ allocations: data });
}

export async function getRootAllocations(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = Number(request.params.id);
  let allocations: Allocation[] = [];

  try {
    await allowedRequesterOrFail(requesterId, paperId, PaperUserRole.Marker);
    allocations = await getActiveRootAllocationsByPaperId(paperId);
  } catch (error) {
    return response.sendStatus(404);
  }

  const data = (await Promise.all(
    allocations.map(allocation => allocation.getData())
  ))
    .filter(allocation => !allocation.questionTemplate.parentQuestionTemplateId)
    .sort(sortAllocationsByQuestionNameThenPaperUserName);
  response.status(200).json({ allocations: data });
}

export async function getAllocationsOfMarker(
  request: Request,
  response: Response
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperUserId = Number(request.params.id);
  let allocations: Allocation[] = [];
  try {
    const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
    const paperId = paperUser.paperId;
    await allowedRequesterOrFail(requesterId, paperId, PaperUserRole.Marker);
    allocations = await getActiveAllocationsByPaperUserId(paperUserId);
  } catch (error) {
    return response.sendStatus(404);
  }

  try {
    const data = await Promise.all(
      allocations.map(allocation => allocation.getListData())
    );
    response.status(200).json({ allocations: data });
  } catch (error) {
    response.sendStatus(500);
  }
}

// hard delete
export async function destroy(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
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

export async function selfAllocations(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const paperId = Number(request.params.paperId);

  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Marker);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;

  const query = getRepository(Allocation)
    .createQueryBuilder("allocation")
    .where("allocation.paperUserId = :paperUserId", {
      paperUserId: requester.id
    })
    .innerJoin(
      "allocation.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    );

  const allocations = await selectAllocationListData(query).getRawMany();

  const data = { allocations };
  response.status(200).json(data);
}
