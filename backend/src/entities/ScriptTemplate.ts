import { IsNotEmpty, IsString } from "class-validator";
import {
  Column,
  Entity,
  getRepository,
  IsNull,
  ManyToOne,
  OneToMany,
  Unique
} from "typeorm";
import { ScriptTemplateData } from "../types/scriptTemplates";
import { Discardable } from "./Discardable";
import { PageTemplate } from "./PageTemplate";
import { Paper } from "./Paper";
import { QuestionTemplate } from "./QuestionTemplate";

@Entity()
@Unique(["paper", "sha256"])
export class ScriptTemplate extends Discardable {
  entityName = "ScriptTemplate";

  constructor(paper: Paper | number, sha256: string) {
    super();
    if (typeof paper === "number") {
      this.paperId = paper;
    } else {
      this.paper = paper;
    }
    this.sha256 = sha256;
  }

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.scriptTemplates)
  paper?: Paper;

  @Column()
  @IsNotEmpty()
  @IsString()
  //@Validate(IsUniqueSha256)
  sha256: string;

  @OneToMany(type => PageTemplate, pageTemplate => pageTemplate.scriptTemplate)
  pageTemplates?: PageTemplate[];

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.scriptTemplate
  )
  questionTemplates?: QuestionTemplate[];

  getData = async (): Promise<ScriptTemplateData> => {
    const questionTemplates =
      this.questionTemplates ||
      (await getRepository(QuestionTemplate).find({
        where: { scriptTemplate: this }
      }));
    const totalMarks = questionTemplates
      .filter(questionTemplate => !questionTemplate.discardedAt)
      .map(questionTemplate => questionTemplate.score)
      .filter(score => score)
      .reduce((a: number, b: number | null) => (b ? a + b : a), 0);

    const pageCount = await getRepository(PageTemplate).count({
      where: { scriptTemplateId: this.id, discardedAt: IsNull() }
    });

    return {
      ...this.getBase(),
      totalMarks,
      pageCount,
      questionTemplates: questionTemplates.map(questionTemplate =>
        questionTemplate.getData()
      )
    };
  };
}
