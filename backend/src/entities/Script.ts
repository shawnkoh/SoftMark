import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, getConnection, ManyToOne, OneToMany } from "typeorm";
import { ScriptListData } from "../types/scripts";
import { Discardable } from "./Discardable";
import { Page } from "./Page";
import { Paper } from "./Paper";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
@Entity()
export class Script extends Discardable {
  entityName = "Script";

  constructor(
    paper: number | Paper,
    filename: string,
    sha256: string,
    student?: number | PaperUser,
    publishedDate?: Date | null
  ) {
    super();
    if (typeof paper === "number") {
      this.paperId = paper;
    } else {
      this.paper = paper;
    }
    this.filename = filename ? filename.toUpperCase() : filename;
    this.sha256 = sha256;
    if (!student) {
      this.studentId = null;
      this.student = null;
    } else if (typeof student === "number") {
      this.studentId = student;
    } else {
      this.student = student;
    }
    this.hasVerifiedStudent = false;
    this.publishedDate = publishedDate || null;
  }

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper?: Paper;

  @Column()
  @IsNotEmpty()
  @IsString()
  // @Validate(IsUniqueFilename)
  filename: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  // @Validate(IsUniqueSha256)
  sha256: string;

  @Column({ nullable: true })
  @IsOptional()
  studentId!: number | null;

  @ManyToOne(type => PaperUser, student => student.scripts)
  student?: PaperUser | null;

  @Column("boolean")
  @IsNotEmpty()
  hasVerifiedStudent: boolean;

  @Column({ type: "timestamp without time zone", nullable: true })
  publishedDate: Date | null;

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];

  getListData = async (): Promise<ScriptListData> => {
    const results = await getConnection().query(`
      SELECT
        script.id,
        script.filename,
        script."createdAt",
        script."updatedAt",
        script."discardedAt",
        student.*,
        page."pageCount",
        question."totalScore",
        question."completedMarking"

      FROM script

      LEFT JOIN (
        SELECT
          "student".id "studentId",
          "student"."matriculationNumber",
          "user".name "studentName",
          "user".email "studentEmail"
        FROM "paper_user" "student"
        INNER JOIN "user" ON student."userId" = "user".id AND "user"."discardedAt" IS NULL
      ) student ON script."studentId" = student."studentId"

      INNER JOIN (
        SELECT
          script.id "scriptId",
          COUNT(page.id)::INTEGER "pageCount"
        FROM script
        INNER JOIN page on script.id = page."scriptId" AND page."discardedAt" IS NULL
        GROUP BY script.id
      ) page ON page."scriptId" = script.id

      INNER JOIN (
        SELECT
          script.id "scriptId",
          COALESCE(SUM(question.score), 0) "totalScore",
          CASE WHEN COUNT(question.score) = COUNT(question."questionId") THEN true ELSE false END "completedMarking"
        FROM script
        LEFT JOIN (
          SELECT question."scriptId", question.id "questionId", mark.score
          FROM question
          LEFT JOIN mark ON mark."questionId" = question.id AND mark."discardedAt" IS NULL
          WHERE question."discardedAt" IS NULL
        ) question ON script.id = question."scriptId"
        GROUP BY script.id
      ) question ON script.id = question."scriptId"

      WHERE script.id = ${this.id}
    `);
    if (results.length !== 1) {
      throw new Error("Unexpected error occured");
    }
    return results[0];
  };
}
