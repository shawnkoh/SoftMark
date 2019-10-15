import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { Question } from "./Question";

@Entity()
export class QuestionTemplate extends Discardable {
  entityName = "QuestionTemplate";

  @ManyToOne(type => Paper, paper => paper.questionTemplates)
  paper!: Paper;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  marks!: number;

  @OneToMany(type => Question, question => question.questionTemplate)
  questions!: Question[];
}
