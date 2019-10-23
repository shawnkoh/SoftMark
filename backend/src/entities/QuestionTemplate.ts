import { IsNotEmpty, IsString, IsNumber } from "class-validator";
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

  @Column()
  parentQuestionTemplateId!: number;

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.childQuestionTemplates
  )
  parentQuestionTemplate?: QuestionTemplate;

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.parentQuestionTemplate
  )
  childQuestionTemplates?: QuestionTemplate[];

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  marks!: number;

  @OneToMany(type => Question, question => question.questionTemplate)
  questions?: Question[];

  @OneToMany(type => Allocation, allocation => allocation.questionTemplate)
  allocations?: Allocation[];

  getListData = (): QuestionTemplateListData => ({
    ...this.getBase(),
    name: this.name,
    marks: this.marks
  });
}
