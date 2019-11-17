import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";

@Entity()
export class Comment extends Discardable {
  entityName = "Comment";

  @Column()
  questionId!: number;

  @ManyToOne(type => Question, question => question.comments)
  question?: Question;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.comments)
  paperUser?: PaperUser;

  @Column()
  @IsNotEmpty()
  @IsString()
  comment!: string;
}
