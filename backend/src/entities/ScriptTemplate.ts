import { Column, Entity, ManyToOne, OneToMany, getRepository } from "typeorm";

import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { QuestionTemplate } from "./QuestionTemplate";
import { ScriptTemplateData } from "../types/scriptTemplates";
import { PageTemplate } from "./PageTemplate";

@Entity()
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

  @Column({ type: "character varying" })
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
      this.pageTemplates.sort((a, b) => {
        if (!a.pageNo || !b.pageNo) {
          return 0;
        }
        return a.pageNo - b.pageNo;
      });
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
        questionTemplates.map(
          async questionTemplate => await questionTemplate.getListData()
        )
      )
    };
  };
}
