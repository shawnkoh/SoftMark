import { Entity, ManyToOne, OneToMany, Column } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { Question } from "./Question";

@Entity()
export class Script extends Discardable {
  entityName = "Script";

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper!: Promise<Paper>;

  @OneToMany(type => Question, question => question.script)
  questions!: Promise<Question[]>;
}
