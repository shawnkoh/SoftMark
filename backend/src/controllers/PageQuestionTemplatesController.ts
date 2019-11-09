import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getManager, getRepository, IsNull, Not } from "typeorm";
import { PageQuestionTemplate } from "../entities/PageQuestionTemplate";
import { PageTemplate } from "../entities/PageTemplate";
import { QuestionTemplate } from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";
import {
  isPageQuestionTemplatePatchData,
  PageQuestionTemplatePostData
} from "../types/pageQuestionTemplates";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequesterOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const scriptTemplateId = Number(request.params.id);
  const postData: PageQuestionTemplatePostData = pick(
    request.body,
    "pageTemplateId",
    "questionTemplateId"
  );
  let scriptTemplate: ScriptTemplate;
  try {
    scriptTemplate = await getRepository(ScriptTemplate).findOneOrFail(
      scriptTemplateId,
      {
        where: { discardedAt: IsNull() },
        relations: ["pageTemplates", "questionTemplates"]
      }
    );
    await allowedRequesterOrFail(
      requesterId,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const pageTemplate = scriptTemplate.pageTemplates!.find(
      pageTemplate =>
        pageTemplate.id === postData.pageTemplateId && !pageTemplate.discardedAt
    );
    if (!pageTemplate) {
      throw new Error("No active PageTemplate found in the Script Template");
    }

    const questionTemplate = scriptTemplate.questionTemplates!.find(
      questionTemplate =>
        questionTemplate.id === postData.questionTemplateId &&
        !questionTemplate.discardedAt
    );
    if (!questionTemplate) {
      throw new Error(
        "No active QuestionTemplate found in the Script Template"
      );
    }
    const pageQuestionTemplate = new PageQuestionTemplate(
      pageTemplate,
      questionTemplate
    );
    await validateOrReject(pageQuestionTemplate);

    await getManager().transaction(async manager => {
      await manager.save(pageQuestionTemplate);
      // TODO: sync PageQuestions
    });

    const data = await pageQuestionTemplate.getData();
    response.status(201).json({ pageQuestionTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const pageQuestionTemplateId = Number(request.params.id);
  const patchData = pick(request.body, "pageTemplateId", "questionTemplateId");
  let pageQuestionTemplate: PageQuestionTemplate;
  let scriptTemplate: ScriptTemplate;
  try {
    pageQuestionTemplate = await getRepository(
      PageQuestionTemplate
    ).findOneOrFail(pageQuestionTemplateId, {
      where: { discardedAt: IsNull() },
      relations: ["pageTemplate", "pageTemplate.scriptTemplate"]
    });
    scriptTemplate = pageQuestionTemplate.pageTemplate!.scriptTemplate!;

    await allowedRequesterOrFail(
      requesterId,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    if (!isPageQuestionTemplatePatchData(patchData)) {
      throw new Error("Invalid input");
    }
    const pageTemplate = await getRepository(PageTemplate).findOneOrFail(
      patchData.pageTemplateId,
      { where: { scriptTemplate, discardedAt: IsNull() } }
    );
    const questionTemplate = await getRepository(
      QuestionTemplate
    ).findOneOrFail(patchData.questionTemplateId, {
      where: { scriptTemplate, discardedAt: IsNull() }
    });

    pageQuestionTemplate.pageTemplate = pageTemplate;
    pageQuestionTemplate.questionTemplate = questionTemplate;
    await validateOrReject(pageQuestionTemplate);
    await getRepository(PageQuestionTemplate).save(pageQuestionTemplate);

    const data = await pageQuestionTemplate.getData();
    response.status(200).json({ pageQuestionTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const pageQuestionTemplateId = Number(request.params.id);
  try {
    const pageQuestionTemplate = await getRepository(
      PageQuestionTemplate
    ).findOneOrFail(pageQuestionTemplateId, {
      where: { discardedAt: IsNull() },
      relations: ["pageTemplate", "pageTemplate.scriptTemplate"]
    });
    const scriptTemplate = pageQuestionTemplate.pageTemplate!.scriptTemplate!;

    await allowedRequesterOrFail(
      requesterId,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    await getRepository(PageQuestionTemplate).update(pageQuestionTemplateId, {
      discardedAt: new Date()
    });
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const pageQuestionTemplateId = Number(request.params.id);
  let pageQuestionTemplate: PageQuestionTemplate;
  try {
    pageQuestionTemplate = await getRepository(
      PageQuestionTemplate
    ).findOneOrFail(pageQuestionTemplateId, {
      where: { discardedAt: Not(IsNull()) },
      relations: ["pageTemplate", "pageTemplate.scriptTemplate"]
    });
    const scriptTemplate = pageQuestionTemplate.pageTemplate!.scriptTemplate!;

    await allowedRequesterOrFail(
      requesterId,
      scriptTemplate.paperId,
      PaperUserRole.Owner
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    pageQuestionTemplate.discardedAt = null;
    await getRepository(PageQuestionTemplate).save(pageQuestionTemplate);

    const data = await pageQuestionTemplate.getData();
    response.status(200).json({ pageQuestionTemplate: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
