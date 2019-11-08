import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import {
  Column,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  Unique
} from "typeorm";
import { PageTemplateListData } from "../types/pageTemplates";
import {
  QuestionTemplateData,
  QuestionTemplateListData
} from "../types/questionTemplates";
import { Allocation } from "./Allocation";
import { Discardable } from "./Discardable";
import { PageQuestionTemplate } from "./PageQuestionTemplate";
import { PageTemplate } from "./PageTemplate";
import { Question } from "./Question";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
@Unique(["scriptTemplate", "name"])
export class QuestionTemplate extends Discardable {
  entityName = "QuestionTemplate";

  constructor(
    scriptTemplate: ScriptTemplate,
    name: string,
    score?: number | null,
    topOffset?: number | null,
    leftOffset?: number | null,
    parentQuestionTemplate?: QuestionTemplate | null
  ) {
    super();
    this.scriptTemplate = scriptTemplate;
    this.name = name;
    this.score = score || null;
    this.topOffset = topOffset || null;
    this.leftOffset = leftOffset || null;
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

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.childQuestionTemplates
  )
  parentQuestionTemplate?: QuestionTemplate | null;

  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsNumber()
  topOffset: number | null;

  @Column({ type: "integer", nullable: true })
  @IsOptional()
  @IsNumber()
  leftOffset: number | null;

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.parentQuestionTemplate
  )
  childQuestionTemplates?: QuestionTemplate[];

  @OneToMany(
    type => PageQuestionTemplate,
    pageQuestionTemplate => pageQuestionTemplate.questionTemplate,
    { cascade: true }
  )
  pageQuestionTemplates?: PageQuestionTemplate[];

  @Column()
  @IsNotEmpty()
  @IsString()
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

  getListData = async (): Promise<QuestionTemplateListData> => {
    // inherit parent's discarded at - see DEVELOPER.md
    let discardedAt = this.discardedAt;
    if (!discardedAt) {
      const scriptTemplate =
        this.scriptTemplate ||
        (await getRepository(ScriptTemplate).findOneOrFail(
          this.scriptTemplateId
        ));
      discardedAt = scriptTemplate.discardedAt;
    }

    return {
      ...this.getBase(),
      discardedAt,
      scriptTemplateId: this.scriptTemplateId,
      name: this.name,
      score: this.score,
      parentQuestionTemplateId: this.parentQuestionTemplateId,
      topOffset: this.topOffset,
      leftOffset: this.leftOffset
    };
  };

  getData = async (): Promise<QuestionTemplateData> => {
    const pageTemplates = await this.getPageTemplates();
    const childQuestionTemplates = await Promise.all(
      (
        this.childQuestionTemplates ||
        (await getRepository(QuestionTemplate).find({
          parentQuestionTemplate: this
        }))
      ).map(async child => await child.getListData())
    );

    return {
      ...(await this.getListData()),
      childQuestionTemplates,
      pageTemplates
    };
  };
}

export default QuestionTemplate;
