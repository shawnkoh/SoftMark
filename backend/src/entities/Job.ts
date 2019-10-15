import { Entity, ManyToOne } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";

@Entity()
export class Job extends Discardable {
  entityName = "Job";

  @ManyToOne(type => QuestionTemplate, questionTemplate => questionTemplate.jobs)
  questionTemplate!: QuestionTemplate;

  @ManyToOne(type => PaperUser, paperUser => paperUser.jobs)
  paperUser!: PaperUser;
}
