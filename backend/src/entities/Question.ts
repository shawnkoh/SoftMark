import { Entity, ManyToOne, OneToMany, Column } from "typeorm";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { QuestionTemplate } from "./QuestionTemplate";
import { Script } from "./Script";
import { Comment } from "./Comment";
import { Bookmark } from "./Bookmark";

@Entity()
export class Question extends Discardable {
  entityName = "Question";

  @Column()
  questionTemplateId!: number;
  
  @ManyToOne(type => QuestionTemplate, questionTemplate => questionTemplate.questions)
  questionTemplate?: QuestionTemplate;

  @Column()
  scriptId!: number;

  @ManyToOne(type => Script, script => script.questions)
  script?: Script;

  @OneToMany(type => Mark, mark => mark.question)
  marks?: Mark[];

  @OneToMany(type => Bookmark, bookmark => bookmark.question)
  bookmarks?: Bookmark[];

  @OneToMany(type => Comment, comment => comment.question)
  comments?: Comment[];
}
