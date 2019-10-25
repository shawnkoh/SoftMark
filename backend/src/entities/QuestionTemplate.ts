import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  Unique,
  getRepository
} from "typeorm";

import { Allocation } from "./Allocation";
import { Discardable } from "./Discardable";
import { Question } from "./Question";
import { ScriptTemplate } from "./ScriptTemplate";
import { PageQuestionTemplate } from "./PageQuestionTemplate";
import { PageTemplate } from "./PageTemplate";
import {
  QuestionTemplateListData,
  QuestionTemplateData
} from "../types/questionTemplates";
import { PageTemplateListData } from "../types/pageTemplates";

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

  @OneToMany(
    type => PageQuestionTemplate,
    pageQuestionTemplate => pageQuestionTemplate.questionTemplate
  )
  pageQuestionTemplates?: PageQuestionTemplate[];

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

  getData = async (): Promise<QuestionTemplateData> => {
    const pageQuestionTemplates = this.pageQuestionTemplates;
    let pageTemplates: PageTemplateListData[];
    if (
      pageQuestionTemplates &&
      !pageQuestionTemplates.some(
        pageQuestionTemplate => !pageQuestionTemplate.pageTemplate
      )
    ) {
      pageTemplates = pageQuestionTemplates.map(pageQuestionTemplate =>
        pageQuestionTemplate.pageTemplate!.getListData()
      );
    } else {
      pageTemplates = (await getRepository(PageTemplate)
        .createQueryBuilder("pageTemplate")
        .leftJoin("pageTemplate.pageQuestionTemplates", "pageQuestionTemplates")
        .leftJoin("pageQuestionTemplates.questionTemplate", "questionTemplate")
        .getMany()).map(pageTemplate => pageTemplate.getListData());
    }

    const childQuestionTemplates = (
      this.childQuestionTemplates ||
      (await getRepository(QuestionTemplate).find({
        parentQuestionTemplate: this
      }))
    ).map(child => child.getListData());

    return {
      ...this.getListData(),
      childQuestionTemplates,
      pageTemplates
    };
  };
}
