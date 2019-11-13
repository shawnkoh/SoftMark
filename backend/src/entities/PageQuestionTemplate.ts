import { Column, Entity, getRepository, ManyToOne, Unique } from "typeorm";
import {
  PageQuestionTemplateData,
  PageQuestionTemplateListData
} from "../types/pageQuestionTemplates";
import { Discardable } from "./Discardable";
import { PageTemplate } from "./PageTemplate";
import { QuestionTemplate } from "./QuestionTemplate";

@Entity()
@Unique(["pageTemplate", "questionTemplate"])
export class PageQuestionTemplate extends Discardable {
  entityName = "PageQuestionTemplate";

  constructor(pageTemplate: PageTemplate, questionTemplate: QuestionTemplate) {
    super();
    this.pageTemplate = pageTemplate;
    this.questionTemplate = questionTemplate;
  }

  @Column()
  pageTemplateId!: number;

  @ManyToOne(
    type => PageTemplate,
    pageTemplate => pageTemplate.pageQuestionTemplates
  )
  pageTemplate?: PageTemplate;

  @Column()
  questionTemplateId!: number;

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.pageQuestionTemplates
  )
  questionTemplate?: QuestionTemplate;

  getListData = (): PageQuestionTemplateListData => ({
    ...this.getBase(),
    pageTemplateId: this.pageTemplateId,
    questionTemplateId: this.questionTemplateId
  });

  getData = async (): Promise<PageQuestionTemplateData> => {
    const pageTemplate =
      this.pageTemplate ||
      (await getRepository(PageTemplate).findOneOrFail(this.pageTemplateId));
    const questionTemplate =
      this.questionTemplate ||
      (await getRepository(QuestionTemplate).findOneOrFail(
        this.questionTemplateId
      ));
    return {
      ...this.getListData(),
      pageTemplate: pageTemplate.getListData(),
      questionTemplate: questionTemplate.getData()
    };
  };
}
