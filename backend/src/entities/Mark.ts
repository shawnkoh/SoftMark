import {
  IsNotEmpty,
  IsNumber,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
  Validate
} from "class-validator";
import { Entity, ManyToOne, Column, getRepository } from "typeorm";

import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
import { MarkData, MarkListData } from "../types/marks";
import { QuestionTemplate } from "./QuestionTemplate";

@ValidatorConstraint({ name: "IsValidScore", async: true })
class IsValidScoreConstraint implements ValidatorConstraintInterface {
  async validate(score: number, args: ValidationArguments) {
    const questionId = (args.object as any)["questionId"];
    const question: Question =
      (args.object as any)["question"] ||
      (await getRepository(Question).findOneOrFail(questionId, {
        relations: ["questionTemplate"]
      }));
    const questionTemplate =
      question.questionTemplate ||
      (await getRepository(QuestionTemplate).findOneOrFail(
        question.questionTemplateId
      ));
    if (!questionTemplate.score || score > questionTemplate.score) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Invalid score";
  }
}

@Entity()
export class Mark extends Discardable {
  entityName = "Mark";

  constructor(question: Question, marker: PaperUser, score: number) {
    super();
    this.question = question;
    this.marker = marker;
    this.score = score;
  }

  @Column()
  questionId!: number;

  @ManyToOne(type => Question, question => question.marks)
  question?: Question;

  @Column()
  markerId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.marks)
  marker?: PaperUser;

  @Column({ type: "double precision" })
  @IsNotEmpty()
  @IsNumber()
  @Validate(IsValidScoreConstraint)
  score: number;

  // TODO: Not in MVP
  // @Column()
  // @IsNotEmpty()
  // @IsNumber()
  // timeSpent!: number;

  getListData = (): MarkListData => ({
    ...this.getBase(),
    questionId: this.questionId,
    markerId: this.markerId,
    score: this.score
  });

  getData = async (): Promise<MarkData> => {
    this.question = await getRepository(Question).findOneOrFail(
      this.questionId
    );
    this.marker = await getRepository(PaperUser).findOneOrFail(this.markerId);
    return {
      ...this.getListData(),
      question: await this.question.getListData(),
      marker: await this.marker.getListData()
    };
  };
}
