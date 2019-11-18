import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { PageTemplate } from "./PageTemplate";
import { QuestionTemplate } from "./QuestionTemplate";
import { Base } from "./Base";

@Entity()
@Unique(["pageTemplate", "questionTemplate"])
export class PageQuestionTemplate extends Base {
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
}
