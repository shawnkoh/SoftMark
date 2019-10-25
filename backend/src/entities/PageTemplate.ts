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
    ...this.getBase()
  });

  getData = async (): Promise<PageTemplateData> => {
    const pageQuestionTemplates = this.pageQuestionTemplates;
    let questionTemplates: QuestionTemplateListData[];
    if (
      pageQuestionTemplates &&
      !pageQuestionTemplates.some(
        pageQuestionTemplate => !pageQuestionTemplate.questionTemplate
      )
    ) {
      questionTemplates = pageQuestionTemplates.map(pageQuestionTemplate =>
        pageQuestionTemplate.questionTemplate!.getListData()
      );
    } else {
      questionTemplates = await getRepository(QuestionTemplate)
        .createQueryBuilder("questionTemplate")
        .leftJoin(
          "questionTemplate.pageQuestionTemplate",
          "pageQuestionTemplate"
        )
        .leftJoin("pageQuestionTemplate.pageTemplate", "pageTemplate")
        .getMany();
    }

    return {
      ...this.getListData(),
      questionTemplates
    };
  };
}
