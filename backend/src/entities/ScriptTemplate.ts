import { IsNotEmpty, IsString, Validate } from "class-validator";
import {
  Column,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  Unique
} from "typeorm";
import IsUniqueSha256 from "../constraints/IsUniqueSha256";
import { ScriptTemplateData } from "../types/scriptTemplates";
import { sortByPageNo } from "../utils/sorts";
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
  @Validate(IsUniqueSha256)
  sha256: string;

  @OneToMany(type => PageTemplate, pageTemplate => pageTemplate.scriptTemplate)
  pageTemplates?: PageTemplate[];

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.scriptTemplate
  )
  questionTemplates?: QuestionTemplate[];

  getData = async (): Promise<ScriptTemplateData> => {
    if (this.pageTemplates) {
      this.pageTemplates.sort(sortByPageNo);
    }
    const questionTemplates =
      this.questionTemplates ||
      (await getRepository(QuestionTemplate).find({
        where: { scriptTemplate: this }
      }));
    const pageTemplates =
      this.pageTemplates ||
      (await getRepository(PageTemplate).find({
        where: { scriptTemplate: this },
        order: { pageNo: "ASC" }
      }));
    return {
      ...this.getBase(),
      pageTemplates: pageTemplates.map(pageTemplate =>
        pageTemplate.getListData()
      ),
      questionTemplates: await Promise.all(
        questionTemplates.map(async questionTemplate =>
          questionTemplate.getData()
        )
      )
    };
  };
}
