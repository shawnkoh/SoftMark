import { Entity, ManyToOne, Column } from "typeorm";
import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";
import { AllocationListData, AllocationData } from "../types/allocations";

@Entity()
export class Allocation extends Base {
  entityName = "Allocation";

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

  @Column()
  totalAllocated!: number;

  getListData = (): AllocationListData => ({
    ...this.getBase(),
    questionTemplateId: this.questionTemplateId,
    paperUserId: this.paperUserId
  });

  getData = (): AllocationData => ({
    ...this.getListData()
  });
}
