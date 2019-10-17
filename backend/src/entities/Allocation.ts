import { Entity, ManyToOne } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";

@Entity()
export class Allocation extends Discardable {
  entityName = "Allocation";

  @ManyToOne(type => QuestionTemplate, questionTemplate => questionTemplate.allocations)
  questionTemplate!: QuestionTemplate;

  @ManyToOne(type => PaperUser, paperUser => paperUser.allocations)
  paperUser!: PaperUser;
}
