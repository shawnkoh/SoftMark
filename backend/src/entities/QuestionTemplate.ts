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

  constructor(
    scriptTemplate: ScriptTemplate,
    name: string,
    score: number | null,
    parentQuestionTemplate?: QuestionTemplate | null
  ) {
    super();
    this.scriptTemplate = scriptTemplate;
    if (name) {
      this.name = name;
    }
    if (score) {
      this.score = score;
    }
    this.parentQuestionTemplate = parentQuestionTemplate;
  }

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

  getPageTemplates = async (): Promise<PageTemplateListData[]> => {
    // Check whether pageTemplates has already been loaded
    const pageQuestionTemplates = this.pageQuestionTemplates;
    if (
      pageQuestionTemplates &&
      pageQuestionTemplates.every(
        pageQuestionTemplate => !!pageQuestionTemplate.pageTemplate
      )
    ) {
      return pageQuestionTemplates.map(pageQuestionTemplate =>
        pageQuestionTemplate.pageTemplate!.getListData()
      );
    }

    return (await getRepository(PageTemplate)
      .createQueryBuilder("pageTemplate")
      .leftJoin("pageTemplate.pageQuestionTemplates", "pageQuestionTemplates")
      .leftJoin("pageQuestionTemplates.questionTemplate", "questionTemplate")
      .getMany()).map(pageTemplate => pageTemplate.getListData());
  };

  getListData = (): QuestionTemplateListData => ({
    ...this.getBase(),
    scriptTemplateId: this.scriptTemplateId,
    name: this.name,
    score: this.score,
    parentQuestionTemplateId: this.parentQuestionTemplateId
  });

  getData = async (): Promise<QuestionTemplateData> => {
    const pageTemplates = await this.getPageTemplates();
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
