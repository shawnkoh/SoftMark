import { Entity, ManyToOne } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";

@Entity()
export class Script extends Discardable {
  entityName = "Script";

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper!: Paper;
}
