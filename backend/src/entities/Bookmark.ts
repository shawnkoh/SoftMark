import { Entity, ManyToOne, Column } from "typeorm";
import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";

@Entity()
export class Bookmark extends Base {
  entityName = "Bookmark";

  @Column()
  questionId!: number;

  @ManyToOne(type => Question, question => question.bookmarks)
  question?: Question;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.bookmarks)
  paperUser?: PaperUser;
}
