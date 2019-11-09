import { Request, Response } from "express";
import { getRepository, IsNull } from "typeorm";
import { PageTemplate } from "../entities/PageTemplate";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequesterOrFail } from "../utils/papers";

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const pageTemplateId = request.params.id;
  let pageTemplate: PageTemplate;
  try {
    pageTemplate = await getRepository(PageTemplate).findOneOrFail(
      pageTemplateId,
      {
        where: { discardedAt: IsNull() },
        relations: [
          "scriptTemplate",
          "pageQuestionTemplates",
          "pageQuestionTemplates.questionTemplate"
        ]
      }
    );
    await allowedRequesterOrFail(
      requesterId,
      pageTemplate.scriptTemplate!.paperId,
      PaperUserRole.Student
    );
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    const data = await pageTemplate.getData();
    response.status(200).json({ pageTemplate: data });
  } catch (error) {
    response.sendStatus(500);
  }
}
