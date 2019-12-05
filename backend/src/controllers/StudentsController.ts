import { Request, Response } from "express";
import { createQueryBuilder, getConnection } from "typeorm";
import { PaperUser } from "../entities/PaperUser";
import { PaperUserRole } from "../types/paperUsers";
import { AccessTokenSignedPayload } from "../types/tokens";
import { allowedRequester } from "../utils/papers";

export async function index(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const { paperId } = request.params;
  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Marker);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const students = await createQueryBuilder()
    .select("student.id", "id")
    .addSelect("student.role", "role")
    .addSelect("student.matriculationNumber", "matriculationNumber")
    .addSelect("user.email", "email")
    .addSelect("user.name", "name")
    .addSelect("student.createdAt", "createdAt")
    .addSelect("student.updatedAt", "updatedAt")
    .addSelect("student.discardedAt", "discardedAt")
    .from(PaperUser, "student")
    .innerJoin("student.user", "user", "user.discardedAt IS NULL")
    .where("student.paperId = :paperId", { paperId })
    .andWhere("student.role = 'STUDENT'")
    .andWhere("student.discardedAt IS NULL")
    .getRawMany();

  response.status(200).json({ students });
}

export async function unmatchedStudents(request: Request, response: Response) {
  const payload = response.locals.payload as AccessTokenSignedPayload;
  const { userId } = payload;
  const paperId = Number(request.params.paperId);
  // Defend against SQL Injection
  if (isNaN(paperId)) {
    response.sendStatus(404);
    return;
  }

  const allowed = await allowedRequester(userId, paperId, PaperUserRole.Owner);
  if (!allowed) {
    response.sendStatus(404);
    return;
  }

  const students = await getConnection().query(`
    SELECT
      student.id,
      student.role,
      student."matriculationNumber",
      "user".email,
      "user".name,
      student."createdAt",
      student."updatedAt",
      student."discardedAt"
    FROM paper_user student

    INNER JOIN "user"
    ON student."userId" = "user".id AND "user"."discardedAt" IS NULL
    
    WHERE student."paperId" = ${paperId}
    AND student.role = 'STUDENT'
    AND student."discardedAt" IS NULL
    AND student.id NOT IN (
      SELECT student.id
      FROM paper_user student
      INNER JOIN script
      ON script."studentId" = student.id AND script."discardedAt" IS NULL
      WHERE student."paperId" = ${paperId}
      AND student.role = 'STUDENT'
      AND student."discardedAt" IS NULL
    )
  `);

  response.status(200).json({ students });
}
