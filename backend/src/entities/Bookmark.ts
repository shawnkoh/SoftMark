import { Entity, ManyToOne } from "typeorm";
import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";

@Entity()
export class Bookmark extends Base {
  entityName = "Bookmark";

  @ManyToOne(type => Question, question => question.bookmarks)
  question!: Question;

  @ManyToOne(type => PaperUser, paperUser => paperUser.bookmarks)
  paperUser!: PaperUser;
}
