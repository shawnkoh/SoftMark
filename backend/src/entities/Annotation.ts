import { Entity, ManyToOne, Column } from "typeorm";
import { Base } from "./Base";
import { PaperUser } from "./PaperUser";
import { Page } from "./Page";

@Entity()
export class Annotation extends Base {
  entityName = "Annotation";

  @Column()
  pageId!: number;

  @ManyToOne(type => Page, page => page.annotations)
  page?: Page;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.annotations)
  paperUser?: PaperUser;
}
