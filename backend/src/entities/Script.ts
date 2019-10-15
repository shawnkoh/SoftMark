import { Entity, ManyToOne, OneToMany } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { Question } from "./Question";

@Entity()
export class Script extends Discardable {
  entityName = "Script";

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper!: Paper;

  @OneToMany(type => Question, question => question.script)
  questions!: Question[];
}
