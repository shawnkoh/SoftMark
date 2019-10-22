import { IsNotEmpty, IsNumber } from "class-validator";
import { Entity, ManyToOne, Column, getRepository } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
import { MarkData, MarkListData } from "../types/marks";

@Entity()
export class Mark extends Discardable {
  entityName = "Mark";

  @Column()
  questionId!: number;

  @ManyToOne(type => Question, question => question.marks)
  question?: Question;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.marks)
  paperUser?: PaperUser;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  score!: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  timeSpent!: number;

  getListData = async (): Promise<MarkListData> => ({
    ...this.getBase(),
    questionId: this.questionId,
    paperUserId: this.paperUserId,
    score: this.score
  });

  getData = async (): Promise<MarkData> => {
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
      paperUser: await this.paperUser.getListData(),
      score: this.score
    };
  };
}
