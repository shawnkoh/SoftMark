import { Entity, ManyToOne, Column, getRepository } from "typeorm";
import { Discardable } from "./Discardable";
import { Page } from "./Page";
import { Question } from "./Question";
import { PageQuestionListData, PageQuestionData } from "../types/PageQuestions";

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

  getListData = async (): Promise<PageQuestionListData> => {
    return {
      ...this.getBase(),
      questionId: this.questionId,
      pageId: this.pageId
    };
  };

  getData = async (): Promise<PageQuestionData> => {
    this.page = await getRepository(Page).findOneOrFail(this.pageId);
    this.question = await getRepository(Question).findOneOrFail(
      this.questionId
    );
    return {
      ...this.getBase(),
      questionId: this.questionId,
      question: await this.question.getListData(),
      pageId: this.pageId,
      page: await this.page.getListData()
    };
  };
}
