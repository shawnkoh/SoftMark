import { Entity, ManyToOne } from "typeorm";
import { Discardable } from "./Discardable";
import { Script } from "./Script";
import { QuestionTemplate } from "./QuestionTemplate";

@Entity()
export class Question extends Discardable {
  entityName = "Question";

  @ManyToOne(type => QuestionTemplate, questionTemplate => questionTemplate.questions)
  questionTemplate!: QuestionTemplate;

  @ManyToOne(type => Script, script => script.questions)
  script!: Script;
}
