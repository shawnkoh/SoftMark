import { Column, Entity, ManyToOne, OneToMany, getRepository } from "typeorm";

import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { QuestionTemplate } from "./QuestionTemplate";
import { ScriptTemplateData } from "../types/scriptTemplates";
import { PageTemplate } from "./PageTemplate";

@Entity()
export class ScriptTemplate extends Discardable {
  entityName = "ScriptTemplate";

  constructor(paper: Paper | number) {
    super();
    if (typeof paper === "number") {
      this.paperId = paper;
    } else {
      this.paper = paper;
    }
  }

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.scriptTemplates)
  paper?: Paper;

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
    const pageTemplates =
      this.pageTemplates ||
      (await getRepository(PageTemplate).find({
        where: { scriptTemplate: this }
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
