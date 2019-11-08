import { validate } from "class-validator";
import { Request, Response } from "express";
import { pick } from "lodash";
import { getRepository, IsNull, Not, getManager } from "typeorm";

import { PaperUser } from "../entities/PaperUser";
import { Script } from "../entities/Script";
import { User } from "../entities/User";
import { AccessTokenSignedPayload } from "../types/tokens";
import { PaperUserPostData, PaperUserRole } from "../types/paperUsers";
import { allowedRequester } from "../utils/papers";
import { sendNewPaperUserEmail } from "../utils/sendgrid";
import { sortByMatricNo } from "../utils/sorts";

export async function create(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const paperId = request.params.id;
    const allowed = await allowedRequester(
      payload.id,
      paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }
    const { paper } = allowed;
    const {
      email,
      role,
      matriculationNumber,
      name
    } = request.body as PaperUserPostData;

    const user =
      (await getRepository(User).findOne({ email, discardedAt: IsNull() })) ||
      new User(email);
    const paperUser =
      (await getRepository(PaperUser).findOne({
        user,
        role,
        discardedAt: Not(IsNull())
      })) || new PaperUser(paper, user, role);

    if (name) {
      user.name = name;
    }
    const userErrors = await validate(user);
    if (userErrors.length > 0) {
      return response.sendStatus(400);
    }

    if (matriculationNumber) {
      paperUser.matriculationNumber = matriculationNumber.toUpperCase();
    }
    paperUser.discardedAt = null;
    const errors = await validate(paperUser);
    if (errors.length > 0) {
      return response.sendStatus(400);
    }
    //TODO: need to add uniqueness check to students

    await getManager().transaction(async manager => {
      await getRepository(User).save(user);
      await getRepository(PaperUser).save(paperUser);
    });

    const data = await paperUser.getData();
    //sendNewPaperUserEmail(paperUser); to be added later
    return response.status(201).json({ paperUser: data });
  } catch (error) {
    return response.sendStatus(400);
  }
}

export async function getStudents(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    payload.id,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const students = (await getRepository(PaperUser).find({
    paperId,
    role: PaperUserRole.Student,
    discardedAt: IsNull()
  })).sort(sortByMatricNo);

  const data = await Promise.all(
    students.map(async (student: PaperUser) => await student.getListData())
  );
  return response.status(200).json({ paperUsers: data });
}

export async function getUnmatchedStudents(
  request: Request,
  response: Response
) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const paperId = Number(request.params.id);
  const allowed = await allowedRequester(
    payload.id,
    paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const scripts = await getRepository(Script).find({
    paperId,
    discardedAt: IsNull()
  });

  // store studentIds that have been matched
  const boundedStudentIdsSet: Set<number> = new Set();
  for (let i = 0; i < scripts.length; i++) {
    const studentId = scripts[i].studentId;
    if (studentId) {
      boundedStudentIdsSet.add(studentId);
    }
  }

  const students = (await getRepository(PaperUser).find({
    paperId,
    role: PaperUserRole.Student,
    discardedAt: IsNull()
  }))
    .filter(student => !boundedStudentIdsSet.has(student.id))
    .sort(sortByMatricNo);

  const data = await Promise.all(
    students.map(async (student: PaperUser) => await student.getListData())
  );
  return response.status(200).json({ paperUsers: data });
}

export async function update(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const paperUserId = request.params.id;
  const paperUser = await getRepository(PaperUser).findOne(paperUserId, {
    where: { discardedAt: IsNull() }
  });
  if (!paperUser) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterId,
    paperUser.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  Object.assign(paperUser, pick(request.body, "role", "matriculationNumber"));
  if (paperUser.matriculationNumber) {
    paperUser.matriculationNumber = paperUser.matriculationNumber.toUpperCase();
  }
  const errors = await validate(paperUser);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }
  await getRepository(PaperUser).save(paperUser);

  const data = await paperUser.getData();
  response.status(201).json({ paperUser: data });
}

export async function updateStudent(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const requesterId = payload.id;
  const studentId = request.params.id;
  const student = await getRepository(PaperUser).findOne(studentId, {
    where: { role: PaperUserRole.Student, discardedAt: IsNull() }
  });
  if (!student) {
    response.sendStatus(404);
    return;
  }
  const allowed = await allowedRequester(
    requesterId,
    student.paperId,
    PaperUserRole.Owner
  );
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const user = await getRepository(User).findOne(student.userId);
  if (!user) {
    return response.sendStatus(400);
  }
  Object.assign(user, pick(request.body, "name", "email"));
  const userErrors = await validate(user);
  if (userErrors.length > 0) {
    return response.sendStatus(400);
  }

  Object.assign(student, pick(request.body, "matriculationNumber"));
  student.user = user;
  const errors = await validate(student);
  if (errors.length > 0) {
    response.sendStatus(400);
    return;
  }

  await getManager().transaction(async manager => {
    await getRepository(User).save(user);
    await getRepository(PaperUser).save(student);
  });

  const data = await student.getData();
  response.status(201).json({ paperUser: data });
}

export async function discard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOne(paperUserId, {
      where: { discardedAt: IsNull() }
    });
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    const allowed = await allowedRequester(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(paperUserId, {
      discardedAt: new Date()
    });

    response.sendStatus(204);
  } catch (error) {
    response.sendStatus(400);
  }
}

export async function undiscard(request: Request, response: Response) {
  try {
    const payload = response.locals.payload as AccessTokenSignedPayload;
    const userId = payload.id;
    const paperUserId = Number(request.params.id);
    const paperUser = await getRepository(PaperUser).findOne(paperUserId);
    if (!paperUser) {
      response.sendStatus(404);
      return;
    }
    const allowed = await allowedRequester(
      userId,
      paperUser.paperId,
      PaperUserRole.Owner
    );
    if (!allowed) {
      response.sendStatus(404);
      return;
    }

    await getRepository(PaperUser).update(paperUserId, { discardedAt: null });
    paperUser.discardedAt = null;

    const data = await paperUser.getData();
    response.status(200).json({ paperUser: data });
  } catch (error) {
    response.sendStatus(400);
  }
}
