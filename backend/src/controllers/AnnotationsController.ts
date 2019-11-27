import { validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";
import { Annotation } from "../entities/Annotation";
import { Page } from "../entities/Page";
import { AnnotationPatchData, AnnotationPostData } from "../types/annotations";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function replace(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const pageId = request.params.id;
  const postData: AnnotationPostData = pick(request.body, "layer");
  const page = await getRepository(Page).findOne(pageId, {
    where: { discardedAt: IsNull() },
    relations: ["script"]
  });
  if (!page) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterUserId,
    page.script!.paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;

  let annotation = await getRepository(Annotation).findOne({
    page,
    paperUser: requester
  });
  annotation = annotation || new Annotation(page, requester, postData.layer);
  annotation.layer = postData.layer;
  const errors = await validate(annotation);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Annotation).save(annotation);

  const data = await annotation.getData();
  response.status(201).json({ annotation: data });
}

export async function showSelf(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const pageId = request.params.id;
  const page = await getRepository(Page).findOne(pageId, {
    where: { discardedAt: IsNull() },
    relations: ["script", "annotations"]
  });
  if (!page) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterUserId,
    page.script!.paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { requester } = allowed;

  const ownAnnotation = page.annotations!.find(
    annotation =>
      annotation.pageId === page.id && annotation.paperUserId === requester.id
  );

  if (!ownAnnotation) {
    return response.sendStatus(204);
  }

  const data = await (ownAnnotation as Annotation).getListData();
  response.status(200).json({ annotation: data });
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const annotationId = Number(request.params.id);
  const patchData: AnnotationPatchData = pick(request.body, "layer");
  const annotation = await getRepository(Annotation).findOne(annotationId, {
    relations: ["page", "paperUser"]
  });
  if (!annotation) {
    response.sendStatus(404);
    return;
  }
  const author = annotation.paperUser!;
  if (author.userId !== requesterUserId) {
    response.sendStatus(404);
    return;
  }

  annotation.layer = patchData.layer;
  const errors = await validate(annotation);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Annotation).save(annotation);

  const data = await annotation.getData();
  response.status(200).json({ annotation: data });
}

// hard delete
export async function destroy(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const annotationId = Number(request.params.id);
  const annotation = await getRepository(Annotation).findOne(annotationId, {
    relations: ["paperUser"]
  });
  if (!annotation) {
    response.sendStatus(404);
    return;
  }
  const author = annotation.paperUser!;
  if (author.userId !== requesterUserId) {
    response.sendStatus(404);
    return;
  }

  await getRepository(Annotation).delete(annotationId);
  response.sendStatus(204);
}
