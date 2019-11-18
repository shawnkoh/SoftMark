import { IsNotEmpty, IsNumber, Validate } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import IsValidScoreConstraint from "../constraints/IsValidScoreConstraint";
import { MarkListData } from "../types/marks";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";

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
}
