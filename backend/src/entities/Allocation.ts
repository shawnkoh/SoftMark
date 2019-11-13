import { Column, Entity, getRepository, ManyToOne, Unique } from "typeorm";
import { AllocationData, AllocationListData } from "../types/allocations";
import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";

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
      questionTemplate: questionTemplate.getData(),
      paperUser: await paperUser.getListData()
    };
  };
}
