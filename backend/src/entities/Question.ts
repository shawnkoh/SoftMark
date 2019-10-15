import { Entity, ManyToOne, OneToMany } from "typeorm";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { QuestionTemplate } from "./QuestionTemplate";
import { Script } from "./Script";
import { Comment } from "./Comment";

@Entity()
export class Question extends Discardable {
  entityName = "Question";

  @ManyToOne(type => QuestionTemplate, questionTemplate => questionTemplate.questions)
  questionTemplate!: QuestionTemplate;

  @ManyToOne(type => Script, script => script.questions)
  script!: Script;

  @OneToMany(type => Mark, mark => mark.question)
  marks!: Mark[];

  @OneToMany(type => Comment, comment => comment.question)
  comments!: Comment[];
}
