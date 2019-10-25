import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";
import { Allocation } from "./Allocation";
import { Discardable } from "./Discardable";
import { Question } from "./Question";
import { ScriptTemplate } from "./ScriptTemplate";
import { QuestionTemplateListData } from "../types/questionTemplates";

@Entity()
@Unique(["scriptTemplate", "name"])
export class QuestionTemplate extends Discardable {
  entityName = "QuestionTemplate";

  @Column()
  scriptTemplateId!: number;

  @ManyToOne(
    type => ScriptTemplate,
    scriptTemplate => scriptTemplate.questionTemplates
  )
  scriptTemplate?: ScriptTemplate;

  @Column({ nullable: true })
  parentQuestionTemplateId!: number | null;

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.childQuestionTemplates
  )
  parentQuestionTemplate?: QuestionTemplate | null;

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.parentQuestionTemplate
  )
  childQuestionTemplates?: QuestionTemplate[];

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column({ type: "double precision", nullable: true })
  @IsOptional()
  @IsNumber()
  score!: number | null;

  @OneToMany(type => Question, question => question.questionTemplate)
  questions?: Question[];

  @OneToMany(type => Allocation, allocation => allocation.questionTemplate)
  allocations?: Allocation[];

  getListData = (): QuestionTemplateListData => ({
    ...this.getBase(),
    name: this.name,
    score: this.score,
    parentQuestionTemplateId: this.parentQuestionTemplateId
  });
}
