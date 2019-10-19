import { Entity, ManyToOne, OneToMany, Column } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";

@Entity()
export class Script extends Discardable {
  entityName = "Script";

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.scripts)
  paperUser?: PaperUser;

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper?: Paper;

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];
}
