import { getRepository, IsNull } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { PaperUser } from "../entities/PaperUser";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";

export async function getActiveScriptTemplate(paperId: number) {
  return await getRepository(ScriptTemplate).findOneOrFail({
    paperId,
    discardedAt: IsNull()
  });
}

export async function getActiveQuestionTemplates(paperId: number) {
  const activeScriptTemplate = await getActiveScriptTemplate(paperId);
  return await getRepository(QuestionTemplate).find({
    scriptTemplateId: activeScriptTemplate.id,
    discardedAt: IsNull()
  });
}

export async function getAllocationsByQuestionTemplateIds(
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

export async function getActiveRootAllocationsByPaperId(paperId: number) {
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

export async function getActiveAllocationsByPaperId(paperId: number) {
  const activeQuestionTemplates = await getActiveQuestionTemplates(paperId);
  const activeQuestionTemplateIds = activeQuestionTemplates.map(q => q.id);
  return await getAllocationsByQuestionTemplateIds(activeQuestionTemplateIds);
}

export async function getActiveAllocationsByPaperUserId(paperUserId: number) {
  const paperUser = await getRepository(PaperUser).findOneOrFail(paperUserId);
  const activeAllocations = await getActiveAllocationsByPaperId(
    paperUser.paperId
  );
  return activeAllocations.filter(
    allocation => allocation.paperUserId === paperUserId
  );
}
