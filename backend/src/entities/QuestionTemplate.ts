import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate
} from "class-validator";
import {
  Column,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
  Unique
} from "typeorm";
import IsUniqueQuestionTemplateName from "../constraints/IsUniqueQuestionTemplateName";
import { PageTemplateListData } from "../types/pageTemplates";
import { QuestionTemplateData } from "../types/questionTemplates";
import { Allocation } from "./Allocation";
import { Discardable } from "./Discardable";
import { PageQuestionTemplate } from "./PageQuestionTemplate";
import { PageTemplate } from "./PageTemplate";
import { Question } from "./Question";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
@Unique(["scriptTemplate", "name"])
@Tree("materialized-path")
export class QuestionTemplate extends Discardable {
  entityName = "QuestionTemplate";

  constructor(
    scriptTemplate: ScriptTemplate,
    name: string,
    score?: number | null,
    pageCovered?: string | null,
    displayPage?: number | null,
    topOffset?: number | null,
    leftOffset?: number | null,
    parentQuestionTemplate?: QuestionTemplate | null
  ) {
    super();
    this.scriptTemplate = scriptTemplate;
    this.name = name;
    this.score = score || null;
    this.displayPage = displayPage || null;
    this.topOffset = topOffset || null;
    this.leftOffset = leftOffset || null;
    this.pageCovered = pageCovered || null;
    this.parentQuestionTemplate = parentQuestionTemplate || null;
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

  @TreeParent()
  parentQuestionTemplate?: QuestionTemplate | null;

  @TreeChildren()
  childQuestionTemplates?: QuestionTemplate[];

  @Column({ type: "character varying", nullable: true })
  @IsOptional()
  @IsString()
  pageCovered: string | null;

  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsNumber()
  displayPage: number | null;

  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsNumber()
  topOffset: number | null;

  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsNumber()
  leftOffset: number | null;

  @OneToMany(
    type => PageQuestionTemplate,
    pageQuestionTemplate => pageQuestionTemplate.questionTemplate,
    { cascade: true }
  )
  pageQuestionTemplates?: PageQuestionTemplate[];

  @Column()
  @IsNotEmpty()
  @IsString()
  @Validate(IsUniqueQuestionTemplateName)
  name: string;

  @Column({ type: "double precision", nullable: true })
  @IsOptional()
  @IsNumber()
  score: number | null;

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

  getData = (): QuestionTemplateData => {
    return {
      ...this.getBase(),
      displayPage: this.displayPage,
      leftOffset: this.leftOffset,
      name: this.name,
      pageCovered: this.pageCovered,
      parentQuestionTemplateId: this.parentQuestionTemplateId,
      score: this.score,
      scriptTemplateId: this.scriptTemplateId,
      topOffset: this.topOffset
    };
  };
}

export default QuestionTemplate;
