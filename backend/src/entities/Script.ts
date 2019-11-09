import { IsOptional, IsNotEmpty, IsString, Validate } from "class-validator";
import {
  Entity,
  ManyToOne,
  OneToMany,
  Column,
  getRepository,
  Unique,
  IsNull
} from "typeorm";

import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { Page } from "./Page";
import { Paper } from "./Paper";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
import { QuestionTemplate } from "./QuestionTemplate";
import { User } from "./User";
import { ScriptData, ScriptListData } from "../types/scripts";
import { sortByPageNo } from "../utils/sorts";
import IsUniqueFilename from "../constraints/IsUniqueFilename";
import IsUniqueSha256 from "../constraints/IsUniqueSha256";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
@Unique(["paper", "filename"])
@Unique(["paper", "sha256"])
export class Script extends Discardable {
  entityName = "Script";

  constructor(
    paper: number | Paper,
    filename: string,
    sha256: string,
    student?: number | PaperUser
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
  hasVerifiedStudent!: boolean;

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];

  getListData = async (): Promise<ScriptListData> => {
    const paperUser = this.studentId
      ? await getRepository(PaperUser).findOne(this.studentId)
      : null;
    let awardedMarks = 0;
    let totalMarks = 0;
    const scriptTemplate = await getRepository(ScriptTemplate).findOne({
      where: { paperId: this.paperId, discardedAt: IsNull() },
      relations: ["questionTemplates"]
    });
    if (scriptTemplate) {
      const questionTemplates = await getRepository(QuestionTemplate).find({
        where: { scriptTemplateId: scriptTemplate.id, discardedAt: IsNull() }
      });
      totalMarks = questionTemplates
        .map(questionTemplate => questionTemplate.score)
        .filter(questionTemplate => questionTemplate)
        .reduce((a: number, b: number | null) => (b ? a + b : a), 0);
      const questions = await getRepository(Question).find({
        where: { questionTemplate: questionTemplates, discardedAt: IsNull() }
      });
      const marks = await getRepository(Mark).find({
        where: { question: questions, discardedAt: IsNull() }
      });
      awardedMarks = marks
        .map(questionTemplate => questionTemplate.score)
        .reduce((a: number, b: number) => a + b, 0);
    }
    return {
      ...this.getBase(),
      paperId: this.paperId,
      filename: this.filename,
      student: paperUser ? await paperUser.getData() : null,
      hasVerifiedStudent: this.hasVerifiedStudent,
      awardedMarks,
      totalMarks,
      pagesCount: this.pages
        ? this.pages.length
        : await getRepository(Page).count({ scriptId: this.id }),
      questionsCount: this.questions
        ? this.questions.length
        : await getRepository(Question).count({ scriptId: this.id })
    };
  };

  getData = async (): Promise<ScriptData> => {
    if (this.pages) {
      this.pages.sort(sortByPageNo);
    }
    const pages =
      this.pages ||
      (await getRepository(Page).find({
        where: { scriptId: this.id },
        order: { pageNo: "ASC" }
      }));
    const questions =
      this.questions ||
      (await getRepository(Question).find({ scriptId: this.id }));

    return {
      ...(await this.getListData()),
      pages: await Promise.all(pages.map(page => page.getListData())),
      questions: await Promise.all(
        questions.map(question => question.getListData())
      )
    };
  };
}
