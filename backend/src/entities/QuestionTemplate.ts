import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";

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
}
