import { validate } from "class-validator";
import { Request, Response } from "express";
import _ from "lodash";
import { getConnection, getRepository, getTreeRepository } from "typeorm";
import { Allocation } from "../entities/Allocation";
import { Paper } from "../entities/Paper";
import { PaperUser } from "../entities/PaperUser";
import QuestionTemplate from "../entities/QuestionTemplate";
import { Script } from "../entities/Script";
import { selectPaperData } from "../selectors/papers";
import {
  GradingData,
  MarkerGradingData,
  QuestionTemplateGradingRootData
} from "../types/grading";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";
import { sendScriptEmail } from "../utils/sendgrid";

export async function create(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterUserId = payload.userId;
  const paper = new Paper(request.body.name);
  const paperErrors = await validate(paper);
  if (paperErrors.length > 0) {
    response.sendStatus(400);
    return;
  }

  const paperUser = new PaperUser(
    paper,
    requesterUserId,
    PaperUserRole.Owner,
    true
  );
  const paperUserErrors = await validate(paperUser);
  if (paperUserErrors.length > 0) {
    response.sendStatus(400);
    return;
  }

  await getRepository(Paper).save(paper);
  await getRepository(PaperUser).save(paperUser);

  const data = paper.getData(paperUser.role);
  response.status(201).json({ paper: data });
}

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;

  const data = await selectPaperData()
    .innerJoin(
      "paper.paperUsers",
      "paperUser",
      "paperUser.userId = :userId AND paperUser.discardedAt IS NULL AND paperUser.acceptedInvite = true",
      { userId }
    )
    .getRawMany();

  response.status(200).json({ papers: data });
}

export async function show(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const allowed = await allowedRequester(
    payload.userId,
    request.params.id,
    PaperUserRole.Student
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  const data = paper.getData(requester.role);
  response.status(200).json({ paper: data });
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const allowed = await allowedRequester(
    payload.userId,
    Number(request.params.id),
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  paper.name = request.body.name;
  const errors = await validate(paper);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(Paper).save(paper);

  const data = paper.getData(requester.role);
  response.status(200).json({ paper: data });
}

export async function discard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  const allowed = await allowedRequester(
    payload.userId,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  await getRepository(Paper).update(paperId, {
    discardedAt: new Date()
  });
  response.sendStatus(204);
}

export async function undiscard(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = request.params.id;
  const allowed = await allowedRequester(
    payload.userId,
    Number(request.params.id),
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }
  const { paper, requester } = allowed;

  await getRepository(Paper).update(paperId, {
    discardedAt: undefined
  });

  const data = paper.getData(requester.role);
  response.status(200).json({ paper: data });
}

export async function publish(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const { paperId } = request.params;

  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Owner);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const { paper } = allowed;
  if (paper.publishedDate) {
    response.sendStatus(400);
    return;
  }

  const scripts: {
    id: number;
    studentId: number;
    email: string;
    userName: string;
  }[] = await getRepository(Script)
    .createQueryBuilder("script")
    .where("script.paperId = :paperId", { paperId })
    .andWhere("script.discardedAt is null")
    .innerJoin("script.student", "student", "student.discardedAt is null")
    .innerJoin("student.user", "user", "user.discardedAt is null")
    .select("script.id", "id")
    .addSelect("student.id", "studentId")
    .addSelect("user.email", "email")
    .addSelect("user.name", "name")
    .getRawMany();

  const publishedDate = new Date();

  getConnection().transaction(async manager => {
    await manager.getRepository(Paper).update(paper.id, { publishedDate });
    await manager
      .getRepository(Script)
      .createQueryBuilder("script")
      .update()
      .where("script.id IN (:...ids)", {
        ids: scripts.map(script => script.id)
      })
      .set({ publishedDate })
      .execute();
  });

  scripts.forEach(script => {
    sendScriptEmail(
      paper.name,
      script.studentId,
      script.email,
      script.userName
    );
  });

  response.sendStatus(204);
}

export async function grading(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.userId;
  const paperId = request.params.id;
  const allowed = await allowedRequester(
    requesterId,
    paperId,
    PaperUserRole.Marker
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const paperQuery = () =>
    getRepository(Paper)
      .createQueryBuilder("paper")
      .where("paper.id = :paperId", { paperId })
      .andWhere("paper.discardedAt IS NULL");

  const rootQuestionTemplatesData: {
    id: number;
    name: string;
  }[] = await paperQuery()
    .innerJoin(
      "paper.scriptTemplates",
      "scriptTemplate",
      "scriptTemplate.discardedAt IS NULL"
    )
    .innerJoin(
      "scriptTemplate.questionTemplates",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .andWhere("questionTemplate.parentQuestionTemplateId IS NULL")
    .select("questionTemplate.id", "id")
    .addSelect("questionTemplate.name", "name")
    .orderBy("questionTemplate.displayPage", "ASC")
    .addOrderBy("questionTemplate.topOffset", "ASC")
    .addOrderBy("questionTemplate.leftOffset", "ASC")
    .getRawMany();

  const rootQuestionTemplateIds = rootQuestionTemplatesData.map(
    data => data.id
  );

  const questions: {
    questionTemplateId: number;
    id: number;
    maxScore: number;
    score: number | null;
  }[] = await paperQuery()
    .innerJoin("paper.scripts", "script", "script.discardedAt IS NULL")
    .innerJoin("script.questions", "question", "question.discardedAt IS NULL")
    .innerJoin(
      "question.questionTemplate",
      "questionTemplate",
      "questionTemplate.discardedAt IS NULL"
    )
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL")
    .select("questionTemplate.id", "questionTemplateId")
    .addSelect("question.id", "id")
    .addSelect("questionTemplate.score", "maxScore")
    .addSelect("mark.score", "score")
    .getRawMany();

  let markersData: (MarkerGradingData & { questionTemplateId: number })[] = [];

  if (rootQuestionTemplateIds.length > 0) {
    markersData = await getRepository(Allocation)
      .createQueryBuilder("allocation")
      .innerJoin(
        "allocation.questionTemplate",
        "questionTemplate",
        "questionTemplate.id IN (:...ids)",
        { ids: rootQuestionTemplateIds }
      )
      .innerJoin("allocation.paperUser", "marker", "marker.discardedAt IS NULL")
      .innerJoin("marker.user", "user", "user.discardedAt IS NULL")
      .select("questionTemplate.id", "questionTemplateId")
      .addSelect("user.id", "id")
      .addSelect("user.email", "email")
      .addSelect("user.emailVerified", "emailVerified")
      .addSelect("user.name", "name")
      .getRawMany();
  }

  const markers = _.uniqBy(markersData, "id");

  const markerIdsByQuestionTemplateId = markersData.reduce(
    (collection, currentValue) => {
      const { questionTemplateId, id } = currentValue;
      if (!(questionTemplateId in collection)) {
        collection[questionTemplateId] = new Set<number>();
      }
      collection[questionTemplateId].add(id);
      return collection;
    },
    {} as { [questionTemplateId: number]: Set<number> }
  );

  const rootQuestionTemplates = await Promise.all(
    rootQuestionTemplatesData.map(async root => {
      const descendantQuestionTemplates = await getTreeRepository(
        QuestionTemplate
      ).findDescendants((root as unknown) as QuestionTemplate);
      const descendantQuestionTemplateIds = descendantQuestionTemplates.map(
        descendant => descendant.id
      );
      const leaves = questions.filter(question =>
        descendantQuestionTemplateIds.includes(question.questionTemplateId)
      );
      const totalScore = descendantQuestionTemplates.reduce(
        (accumulator, currentValue) => {
          const { score, discardedAt } = currentValue;
          if (!score || !!discardedAt) {
            return accumulator;
          }
          accumulator = accumulator + score;
          return accumulator;
        },
        0
      );

      const questionCount = leaves.length;
      const markCount = leaves.reduce((count, currentValue) => {
        const { score } = currentValue;
        if (score !== null) {
          count = count + 1;
        }
        return count;
      }, 0);

      const result: QuestionTemplateGradingRootData = {
        ...root,
        totalScore,
        markers: markerIdsByQuestionTemplateId[root.id]
          ? Array.from(markerIdsByQuestionTemplateId[root.id])
          : [],
        questionCount,
        markCount
      };
      return result;
    })
  );

  const data: GradingData = {
    rootQuestionTemplates,
    totalQuestionCount: questions.length,
    totalMarkCount: questions.filter(question => question.score !== null)
      .length,
    markers
  };

  response.status(200).json(data);
}
