import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { PaperUser } from "../entities/PaperUser";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import { selectAllocationListData } from "../selectors/allocations";
import { AllocationPostData } from "../types/allocations";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester, allowedRequesterOrFail } from "../utils/papers";
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

/** helper functions */
async function getActiveScriptTemplate(paperId: number) {
  return await getRepository(ScriptTemplate).findOneOrFail({
    paperId,
    discardedAt: IsNull()
  });
}

async function getActiveQuestionTemplates(paperId: number) {
  const activeScriptTemplate = await getActiveScriptTemplate(paperId);
  return await getRepository(QuestionTemplate).find({
    scriptTemplateId: activeScriptTemplate.id,
    discardedAt: IsNull()
  });
}

async function getAllocationsByQuestionTemplateIds(
  questionTemplateIds: number[]
) {
  return questionTemplateIds.length > 0
    ? await getRepository(Allocation)
        .createQueryBuilder("allocation")
        .where("allocation.questionTemplateId IN (:...ids)", {
          ids: questionTemplateIds
        })
        .getMany()
    : [];
}

async function getActiveRootAllocationsByPaperId(paperId: number) {
  const activeQuestionTemplates = await getActiveQuestionTemplates(paperId);
  const activeRootQuestionTemplates = activeQuestionTemplates.filter(
    x => !x.parentQuestionTemplateId
  );
  const activeRootQuestionTemplateIds = activeRootQuestionTemplates.map(
    q => q.id
  );
  return await getAllocationsByQuestionTemplateIds(
    activeRootQuestionTemplateIds
  );
}

async function getActiveAllocationsByPaperId(paperId: number) {
  const activeQuestionTemplates = await getActiveQuestionTemplates(paperId);
  const activeQuestionTemplateIds = activeQuestionTemplates.map(q => q.id);
  return await getAllocationsByQuestionTemplateIds(activeQuestionTemplateIds);
}

async function getActiveAllocationsByPaperUserId(paperUserId: number) {
  const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
  const activeAllocations = await getActiveAllocationsByPaperId(
    paperUser.paperId
  );
  return activeAllocations.filter(
    allocation => allocation.paperUserId === paperUserId
  );
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
    });

  const allocations = await selectAllocationListData(query).getRawMany();

  const data = { allocations };
  response.status(200).json(data);
}
