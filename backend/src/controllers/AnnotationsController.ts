import { validateOrReject } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull } from "typeorm";

import { Annotation } from "../entities/Annotation";
import { PaperUser } from "../entities/PaperUser";
import { Page } from "../entities/Page";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserRole } from "../types/paperUsers";
import { AnnotationPostData, AnnotationPatchData } from "../types/annotations";
import { allowedRequesterOrFail } from "../utils/papers";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.id;
  const pageId = request.params.id;
  const postData: AnnotationPostData = pick(request.body, "layer");
  let page: Page;
  let paperUser: PaperUser;
  try {
    page = await getRepository(Page).findOneOrFail(pageId, {
      where: { discardedAt: IsNull() },
      relations: ["script"]
    });
    ({ paperUser } = await allowedRequesterOrFail(
      requesterUserId,
      page.script!.paperId,
      PaperUserRole.Marker
    ));
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  

 try {
    // handles both cases where annotation for a page and paper user has already been created
    // or not created yet
    const storedAnnotation = await getRepository(Annotation).findOne({page, paperUser});
    if (storedAnnotation) {
      storedAnnotation.layer = postData.layer;
    }
    const annotation = storedAnnotation ? storedAnnotation : new Annotation(page, paperUser, postData.layer);
    await validateOrReject(annotation);
    await getRepository(Annotation).save(annotation);

    const data = await annotation.getData();
    response.status(201).json({ annotation: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.id;
  const pageId = request.params.id;
  let page: Page;
  let paperUser: PaperUser;
  try {
    page = await getRepository(Page).findOneOrFail(pageId, {
      where: { discardedAt: IsNull() },
      relations: ["script"]
    });
    ({ paperUser } = await allowedRequesterOrFail(
      requesterUserId,
      page.script!.paperId,
      PaperUserRole.Marker
    ));
  } catch (error) {
    response.sendStatus(404);
    return;
  }  

 try {
    const annotation = await getRepository(Annotation).findOneOrFail({page, paperUser});
    const data = await annotation.getData();
    response.status(201).json({ annotation: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.id;
  const annotationId = Number(request.params.id);
  const patchData: AnnotationPatchData = pick(request.body, "layer");
  let annotation: Annotation;
  try {
    annotation = await getRepository(Annotation).findOneOrFail(annotationId, {
      relations: ["page", "paperUser"]
    });
    const author = annotation.paperUser!;
    if (author.userId !== requesterUserId) {
      throw new Error("Requester is not the author of the annotation");
    }
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    annotation.layer = patchData.layer;
    await validateOrReject(annotation);
    await getRepository(Annotation).save(annotation);

    const data = await annotation.getData();
    response.status(200).json({ annotation: data });
  } catch (error) {
    response.sendStatus(400);
  }
}

// hard delete
export async function destroy(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.id;
  const annotationId = Number(request.params.id);
  try {
    const annotation = await getRepository(Annotation).findOneOrFail(
      annotationId,
      { relations: ["paperUser"] }
    );
    const author = annotation.paperUser!;
    if (author.userId !== requesterUserId) {
      throw new Error("Requester is not the author of the annotation");
    }
  } catch (error) {
    response.sendStatus(404);
    return;
  }

  try {
    await getRepository(Annotation).delete(annotationId);
    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}
