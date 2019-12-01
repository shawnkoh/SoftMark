import { NextFunction, Request, Response } from "express";
import { getRepository, IsNull } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { Mark } from "../entities/Mark";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function canModifyMark(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const markId = request.params.id;
  const mark = await getRepository(Mark).findOne({
    where: { id: markId, discardedAt: IsNull() },
    relations: [
      "question",
      "question.script",
      "question.questionTemplate",
      "question.questionTemplate.allocations"
    ]
  });
  if (!mark) {
    response.sendStatus(404);
    return;
  }
  const questionTemplate = mark.question!.questionTemplate!;
  const allowed = await allowedRequester(
    requesterUserId,
    mark.question!.script!.paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;

  if (
    requester.role === PaperUserRole.Marker &&
    !(await isAllocated(questionTemplate, requester.id))
  ) {
    response.sendStatus(404);
    return;
  }

  response.locals.mark = mark;
  next();
}

// Prefer loading all the question templates and recursively checking them
// Rather than recursively load since remote DB calls are much slower
export async function isAllocated(
  questionTemplate: QuestionTemplate,
  markerId: number
) {
  const allocations =
    questionTemplate.allocations ||
    (await getRepository(Allocation).find({ questionTemplate }));
  if (!allocations) {
    return false;
  }
  if (allocations.some(allocation => allocation.paperUserId === markerId)) {
    return true;
  }

  const questionTemplates = await getRepository(QuestionTemplate).find({
    where: {
      discardedAt: IsNull(),
      scriptTemplateId: questionTemplate.scriptTemplateId
    },
    relations: ["allocations"]
  });

  return recurse(questionTemplates, questionTemplate, markerId);
}

function recurse(
  questionTemplates: QuestionTemplate[],
  questionTemplate: QuestionTemplate,
  markerId: number
): boolean {
  if (
    questionTemplate.allocations!.some(
      allocation => allocation.paperUserId === markerId
    )
  ) {
    return true;
  }

  if (questionTemplate.parentQuestionTemplateId) {
    const parent = questionTemplates.find(
      parent => parent.id === questionTemplate.parentQuestionTemplateId
    );
    if (!parent) {
      return false;
    }
    return recurse(questionTemplates, parent, markerId);
  }
  return false;
}
