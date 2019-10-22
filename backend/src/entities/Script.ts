import { Entity, ManyToOne, OneToMany, Column, getRepository } from "typeorm";
import { Discardable } from "./Discardable";
import { Page } from "./Page";
import { Paper } from "./Paper";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
import { ScriptData, ScriptListData } from "../types/scripts";

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

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];

  getListData = async (): Promise<ScriptListData> => {
    this.pages = await getRepository(Page).find({ scriptId: this.id });
    this.questions = await getRepository(Question).find({ scriptId: this.id });

    return {
      ...this.getBase(),
      paperUserId: this.paperUserId,
      paperId: this.paperId,
      pagesCount: this.pages.length,
      questionsCount: this.questions.length
    };
  };

  getData = async (): Promise<ScriptData> => {
    this.pages = await getRepository(Page).find({ scriptId: this.id });
    this.questions = await getRepository(Question).find({ scriptId: this.id });

    return {
      ...this.getBase(),
      paperUserId: this.paperUserId,
      paperId: this.paperId,
      pagesCount: this.pages.length,
      pages: await Promise.all(this.pages.map(page => page.getData())),
      questionsCount: this.questions.length,
      questions: await Promise.all(
        this.questions.map(question => question.getData())
      )
    };
  };
}
