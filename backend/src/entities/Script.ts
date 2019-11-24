import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import {
  Column,
  Entity,
  getRepository,
  IsNull,
  ManyToOne,
  OneToMany,
  Unique
} from "typeorm";
import { ScriptData, ScriptListData } from "../types/scripts";
import { sortByPageNo } from "../utils/sorts";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { Page } from "./Page";
import { Paper } from "./Paper";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
import { QuestionTemplate } from "./QuestionTemplate";
import { ScriptTemplate } from "./ScriptTemplate";
import { ScriptTemplateData } from "scriptTemplates";

@Entity()
@Unique(["paper", "filename"])
@Unique(["paper", "sha256"])
export class Script extends Discardable {
  entityName = "Script";

  constructor(
    paper: number | Paper,
    filename: string,
    sha256: string,
    pageCount: number,
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
    this.pageCount = pageCount;
    this.hasVerifiedStudent = false;
    this.hasBeenPublished = false;
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

  @Column("boolean")
  @IsNotEmpty()
  hasBeenPublished!: boolean;

  @Column({ type: "int" })
  pageCount!: number;

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];

  getListDataWithScriptTemplate = async (
    scriptTemplateData: ScriptTemplateData | undefined
  ): Promise<ScriptListData> => {
    const paperUser = this.studentId
      ? await getRepository(PaperUser).findOne(this.studentId)
      : null;

    const questionTemplateIds = scriptTemplateData
      ? scriptTemplateData.questionTemplates.map(
          questionTemplate => questionTemplate.id
        )
      : [-1]; // stub in case of weird behavior of empty arrays

    const questions = (
      this.questions ||
      (await getRepository(Question).find({
        where: {
          scriptId: this.id,
          questionTemplateId: questionTemplateIds,
          discardedAt: IsNull()
        },
        relations: ["marks"]
      }))
    ).filter(question =>
      questionTemplateIds.includes(question.questionTemplateId)
    );

    const add = (a: number, b: number) => a + b;

    const awardedMarks = questions
      .map(question => {
        const marksForQuestion = question.marks ? question.marks : [];
        return marksForQuestion.map(mark => mark.score).reduce(add, 0);
      })
      .reduce(add, 0);

    return {
      ...this.getBase(),
      paperId: this.paperId,
      filename: this.filename,
      student: paperUser ? await paperUser.getStudentData() : null,
      hasVerifiedStudent: this.hasVerifiedStudent,
      hasBeenPublished: this.hasBeenPublished,
      awardedMarks,
      pagesCount: this.pageCount
    };
  };

  getListData = async () => {
    const paperUser = this.studentId
      ? await getRepository(PaperUser).findOne(this.studentId)
      : null;

    const scriptTemplate = await getRepository(ScriptTemplate).findOne({
      where: { paperId: this.paperId, discardedAt: IsNull() },
      relations: ["questionTemplates"]
    });

    let awardedMarks = 0;

    if (scriptTemplate) {
      const questionTemplates = await getRepository(QuestionTemplate).find({
        where: { scriptTemplateId: scriptTemplate.id, discardedAt: IsNull() }
      });
      const questions = await getRepository(Question).find({
        where: {
          scriptId: this.id,
          questionTemplate: questionTemplates,
          discardedAt: IsNull()
        }
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
      student: paperUser ? await paperUser.getStudentData() : null,
      hasVerifiedStudent: this.hasVerifiedStudent,
      hasBeenPublished: this.hasBeenPublished,
      awardedMarks,
      pagesCount: this.pages
        ? this.pages.length
        : await getRepository(Page).count({ scriptId: this.id })
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
      pages: await Promise.all(pages.map(page => page.getData())),
      questions: await Promise.all(
        questions.map(question => question.getListData())
      )
    };
  };
}
