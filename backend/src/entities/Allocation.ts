import { Entity, ManyToOne, Column, getRepository, Unique } from "typeorm";

import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";
import { AllocationListData, AllocationData } from "../types/allocations";

@Entity()
@Unique(["paperUser", "questionTemplate"])
export class Allocation extends Base {
  entityName = "Allocation";

  constructor(questionTemplate: QuestionTemplate, paperUser: PaperUser) {
    super();
    this.questionTemplate = questionTemplate;
    this.paperUser = paperUser;
  }

  @Column()
  questionTemplateId!: number;

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.allocations
  )
  questionTemplate?: QuestionTemplate;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.allocations)
  paperUser?: PaperUser;

  // TODO: Not in MVP
  // @Column()
  // totalAllocated!: number;

  getListData = (): AllocationListData => ({
    ...this.getBase(),
    questionTemplateId: this.questionTemplateId,
    paperUserId: this.paperUserId
  });

  getData = async (): Promise<AllocationData> => {
    const questionTemplate =
      this.questionTemplate ||
      (await getRepository(QuestionTemplate).findOneOrFail(
        this.questionTemplateId
      ));
    const paperUser =
      this.paperUser ||
      (await getRepository(PaperUser).findOneOrFail(this.paperUserId));
    return {
      ...this.getListData(),
      questionTemplate: questionTemplate.getListData(),
      paperUser: await paperUser.getListData()
    };
  };
}
