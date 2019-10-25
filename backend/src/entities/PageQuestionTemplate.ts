import { Entity, ManyToOne, Column } from "typeorm";
import { Discardable } from "./Discardable";
import { PageTemplate } from "./PageTemplate";
import { QuestionTemplate } from "./QuestionTemplate";

@Entity()
export class PageQuestionTemplate extends Discardable {
  entityName = "PageQuestionTemplate";

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
