import { createQueryBuilder, getRepository } from "typeorm";
import Script from "../entities/Script";
import { sendScriptEmail } from "./sendgrid";

async function publishScripts(paperId: number, paperName: string) {
  const matchedScriptsQuery = createQueryBuilder()
    .select("script.id", "id")
    .from(Script, "script")
    .innerJoin("script.student", "student", "student.discardedAt IS NULL")
    .innerJoin("student.user", "user", "user.discardedAt IS NULL")
    .where("script.paperId = :paperId", { paperId })
    .andWhere("script.discardedAt IS NULL")
    .andWhere("script.publishedDate IS NULL");

  const unmarkedScriptsQuery = createQueryBuilder()
    .select("script.id", "id")
    .from(Script, "script")
    .innerJoin("script.questions", "question", "question.discardedAt IS NULL")
    .leftJoin("question.marks", "mark", "mark.discardedAt IS NULL")
    .where(`script.id IN (${matchedScriptsQuery.getQuery()})`)
    .andWhere("mark IS NULL");

  const scripts: {
    id: number;
    studentId: number;
    studentEmail: string;
    studentName: string;
  }[] = await matchedScriptsQuery
    .addSelect("student.id", "studentId")
    .addSelect("user.email", "studentEmail")
    .addSelect("user.name", "studentName")
    .andWhere(`script.id NOT IN (${unmarkedScriptsQuery.getQuery()})`)
    .getRawMany();

  if (scripts.length === 0) {
    return 0;
  }

  await getRepository(Script)
    .createQueryBuilder("script")
    .update()
    .where("script.id IN (:...ids)", {
      ids: scripts.map(script => script.id)
    })
    .set({ publishedDate: new Date() })
    .execute();

  scripts.forEach(script => {
    sendScriptEmail(
      paperName,
      script.studentId,
      script.studentEmail,
      script.studentName
    );
  });

  return scripts.length;
}

export default publishScripts;
