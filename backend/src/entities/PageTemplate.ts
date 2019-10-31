import { Column, Entity, ManyToOne, OneToMany, getRepository } from "typeorm";

import { Discardable } from "./Discardable";
import { PageQuestionTemplate } from "./PageQuestionTemplate";
import { QuestionTemplate } from "./QuestionTemplate";
import { ScriptTemplate } from "./ScriptTemplate";
import { PageTemplateListData, PageTemplateData } from "../types/pageTemplates";
import { QuestionTemplateListData } from "../types/questionTemplates";

@Entity()
export class PageTemplate extends Discardable {
  entityName = "PageTemplate";

  constructor(scriptTemplate: ScriptTemplate | number) {
    super();
    if (typeof scriptTemplate === "number") {
      this.scriptTemplateId = scriptTemplate;
    } else {
      this.scriptTemplate = scriptTemplate;
    }
  }

  @Column()
  scriptTemplateId!: number;

  @ManyToOne(
    type => ScriptTemplate,
    scriptTemplate => scriptTemplate.pageTemplates
  )
  scriptTemplate?: ScriptTemplate;

  @OneToMany(
    type => PageQuestionTemplate,
    pageQuestionTemplate => pageQuestionTemplate.pageTemplate
  )
  pageQuestionTemplates?: PageQuestionTemplate[];

  getListData = (): PageTemplateListData => ({
    ...this.getBase(),
    scriptTemplateId: this.scriptTemplateId
  });

  getData = async (): Promise<PageTemplateData> => {
    const pageQuestionTemplates = this.pageQuestionTemplates;
    let questionTemplates: QuestionTemplateListData[];
    if (
      pageQuestionTemplates &&
      pageQuestionTemplates.every(
        pageQuestionTemplate => !!pageQuestionTemplate.questionTemplate
      )
    ) {
      questionTemplates = pageQuestionTemplates.map(pageQuestionTemplate =>
        pageQuestionTemplate.questionTemplate!.getListData()
      );
    } else {
      questionTemplates = (await getRepository(QuestionTemplate)
        .createQueryBuilder("questionTemplate")
        .leftJoin(
          "questionTemplate.pageQuestionTemplates",
          "pageQuestionTemplates"
        )
        .leftJoin("pageQuestionTemplates.pageTemplate", "pageTemplate")
        .getMany()).map(questionTemplate => questionTemplate.getListData());
    }

    return {
      ...this.getListData(),
      questionTemplates
    };
  };
}
