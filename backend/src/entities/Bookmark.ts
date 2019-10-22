import { Entity, ManyToOne, Column, getRepository } from "typeorm";
import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
import { BookmarkData, BookmarkListData } from "../types/bookmarks";

@Entity()
export class Bookmark extends Base {
  entityName = "Bookmark";

  @Column()
  questionId!: number;

  @ManyToOne(type => Question, question => question.bookmarks)
  question?: Question;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.bookmarks)
  paperUser?: PaperUser;

  retrieveFromRepostitory = async (): Promise<void> => {
    this.question = await getRepository(Question).findOneOrFail(
      this.questionId
    );
    this.paperUser = await getRepository(PaperUser).findOneOrFail(
      this.paperUserId
    );
  };

  getListData = async (): Promise<BookmarkListData> => ({
    ...this.getBase(),
    questionId: this.questionId,
    paperUserId: this.paperUserId
  });

  getData = async (): Promise<BookmarkData> => {
    this.question = await getRepository(Question).findOneOrFail(
      this.questionId
    );
    this.paperUser = await getRepository(PaperUser).findOneOrFail(
      this.paperUserId
    );
    return {
      ...this.getBase(),
      questionId: this.questionId,
      question: await this.question.getListData(),
      paperUserId: this.paperUserId,
      paperUser: await this.paperUser.getListData()
    };
  };
}
