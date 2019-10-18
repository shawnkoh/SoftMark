import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Allocation } from "./Allocation";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { Question } from "./Question";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
export class QuestionTemplate extends Discardable {
  entityName = "QuestionTemplate";

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.questionTemplates)
  paper!: Promise<Paper>;

  @Column()
  scriptTemplateId!: number;

  @ManyToOne(type => ScriptTemplate, scriptTemplate => scriptTemplate.questionTemplates)
  scriptTemplate!: Promise<ScriptTemplate>;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  marks!: number;

  @OneToMany(type => Question, question => question.questionTemplate)
  questions!: Promise<Question[]>;

  @OneToMany(type => Allocation, allocation => allocation.questionTemplate)
  allocations!: Promise<Allocation[]>;
}
