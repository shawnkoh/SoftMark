import { Entity, ManyToOne, Column } from "typeorm";
import { Discardable } from "./Discardable";
import { Page } from "./Page";
import { Question } from "./Question";

@Entity()
export class PageQuestion extends Discardable {
  entityName = "PageQuestion";

  @Column()
  pageId!: number;

  @ManyToOne(type => Page, page => page.pageQuestions)
  page?: Page;

  @Column()
  questionId!: number;

  @ManyToOne(type => Question, question => question.pageQuestions)
  question?: Question;
}
