import { Column, Entity, getRepository, ManyToOne, OneToMany } from "typeorm";
import { PageTemplateData, PageTemplateListData } from "../types/pageTemplates";
import { QuestionTemplateData } from "../types/questionTemplates";
import { Discardable } from "./Discardable";
import { PageQuestionTemplate } from "./PageQuestionTemplate";
import { QuestionTemplate } from "./QuestionTemplate";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
export class PageTemplate extends Discardable {
  entityName = "PageTemplate";

  constructor(
    scriptTemplate: ScriptTemplate | number,
    imageUrl: string,
    pageNo: number
  ) {
    super();
    if (typeof scriptTemplate === "number") {
      this.scriptTemplateId = scriptTemplate;
    } else {
      this.scriptTemplate = scriptTemplate;
    }
    this.imageUrl = imageUrl;
    this.pageNo = pageNo;
  }

  @Column()
  scriptTemplateId!: number;

  @ManyToOne(
    type => ScriptTemplate,
    scriptTemplate => scriptTemplate.pageTemplates
  )
  scriptTemplate?: ScriptTemplate;

  @Column({ type: "character varying" })
  imageUrl!: string;

  @Column({ type: "int" })
  pageNo!: number;

  @OneToMany(
    type => PageQuestionTemplate,
    pageQuestionTemplate => pageQuestionTemplate.pageTemplate
  )
  pageQuestionTemplates?: PageQuestionTemplate[];

  getListData = (): PageTemplateListData => ({
    ...this.getBase(),
    scriptTemplateId: this.scriptTemplateId,
    pageNo: this.pageNo,
    imageUrl: this.imageUrl
  });

  getData = async (): Promise<PageTemplateData> => {
    const pageQuestionTemplates = this.pageQuestionTemplates;
    let questionTemplates: QuestionTemplateData[];
    if (
      pageQuestionTemplates &&
      pageQuestionTemplates.every(
        pageQuestionTemplate => !!pageQuestionTemplate.questionTemplate
      )
    ) {
      questionTemplates = await Promise.all(
        pageQuestionTemplates.map(async pageQuestionTemplate =>
          pageQuestionTemplate.questionTemplate!.getData()
        )
      );
    } else {
      questionTemplates = await Promise.all(
        (await getRepository(QuestionTemplate)
          .createQueryBuilder("questionTemplate")
          .leftJoin(
            "questionTemplate.pageQuestionTemplates",
            "pageQuestionTemplates"
          )
          .leftJoin("pageQuestionTemplates.pageTemplate", "pageTemplate")
          .getMany()).map(async questionTemplate => questionTemplate.getData())
      );
    }

    return {
      ...this.getListData(),
      questionTemplates
    };
  };
}
