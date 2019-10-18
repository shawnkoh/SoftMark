import { IsNotEmpty, IsNumber } from "class-validator";
import { Entity, ManyToOne, Column } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";

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
}
