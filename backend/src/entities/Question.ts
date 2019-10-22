import { Entity, ManyToOne, OneToMany, Column, Unique } from "typeorm";
import { Bookmark } from "./Bookmark";
import { Comment } from "./Comment";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { PageQuestion } from "./PageQuestion";
import { QuestionTemplate } from "./QuestionTemplate";
import { Script } from "./Script";

@Entity()
@Unique(["script", "questionTemplate"])
export class Question extends Discardable {
  entityName = "Question";

  @Column()
  questionTemplateId!: number;

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.questions
  )
  questionTemplate?: QuestionTemplate;

  @Column()
  scriptId!: number;

  @ManyToOne(type => Script, script => script.questions)
  script?: Script;

  @OneToMany(type => PageQuestion, pageQuestion => pageQuestion.question)
  pageQuestions?: PageQuestion[];

  @OneToMany(type => Mark, mark => mark.question)
  marks?: Mark[];

  @OneToMany(type => Bookmark, bookmark => bookmark.question)
  bookmarks?: Bookmark[];

  @OneToMany(type => Comment, comment => comment.question)
  comments?: Comment[];
}
