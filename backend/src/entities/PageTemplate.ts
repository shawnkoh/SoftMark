import { Column, Entity, ManyToOne, OneToMany, getRepository } from "typeorm";
import { Discardable } from "./Discardable";
import { ScriptTemplate } from "./ScriptTemplate";
import { PageTemplateListData, PageTemplateData } from "../types/PageTemplates";
import { PageQuestionTemplate } from "./PageQuestionTemplate";
import { QuestionTemplate } from "./QuestionTemplate";
import { QuestionTemplateListData } from "../types/questionTemplates";

@Entity()
export class PageTemplate extends Discardable {
  entityName = "PageTemplate";

  constructor(scriptTemplate: ScriptTemplate) {
    super();
    this.scriptTemplate = scriptTemplate;
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
