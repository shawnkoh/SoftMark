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

  constructor();
  constructor(paper?: Paper, paperUser?: PaperUser, imageUrls?: string[]);
  constructor(paper?: Paper, paperUser?: PaperUser, imageUrls?: string[]) {
    super();
    this.paper = paper;
    this.paperUser = paperUser;
    this.imageUrls = imageUrls;
  }

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.scripts)
  paperUser?: PaperUser;

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper?: Paper;

  @Column({ type: 'character varying', array: true, nullable: true })
  imageUrls?: string[];

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];

  getListData = async (): Promise<ScriptListData> => ({
    ...this.getBase(),
    paperUserId: this.paperUserId,
    paperId: this.paperId,
    imageUrlCount: this.imageUrls ? this.imageUrls.length : 0,
    imageUrls: this.imageUrls ? this.imageUrls : [],
    pagesCount: this.pages
      ? this.pages.length
      : await getRepository(Page).count({ scriptId: this.id }),
    questionsCount: this.questions
      ? this.questions.length
      : await getRepository(Question).count({ scriptId: this.id })
  });

  getData = async (): Promise<ScriptData> => {
    const pages =
      this.pages || (await getRepository(Page).find({ scriptId: this.id }));
    const questions =
      this.questions ||
      (await getRepository(Question).find({ scriptId: this.id }));

    return {
      ...(await this.getListData()),
      pages: await Promise.all(pages.map(page => page.getListData())),
      questions: await Promise.all(
        questions.map(question => question.getListData())
      )
    };
  };
}
