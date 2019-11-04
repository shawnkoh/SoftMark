import { IsOptional } from "class-validator";
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

  constructor(paper: number | Paper, student?: number | PaperUser) {
    super();
    if (typeof paper === "number") {
      this.paperId = paper;
    } else {
      this.paper = paper;
    }
    if (!student) {
      this.studentId = null;
      this.student = null;
    } else if (typeof student === "number") {
      this.studentId = student;
    } else {
      this.student = student;
    }
  }

  @Column({ nullable: true })
  @IsOptional()
  studentId!: number | null;

  @ManyToOne(type => PaperUser, student => student.scripts)
  student?: PaperUser | null;

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper?: Paper;

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];

  getListData = async (): Promise<ScriptListData> => ({
    ...this.getBase(),
    studentId: this.studentId,
    paperId: this.paperId,
    pagesCount: this.pages
      ? this.pages.length
      : await getRepository(Page).count({ scriptId: this.id }),
    questionsCount: this.questions
      ? this.questions.length
      : await getRepository(Question).count({ scriptId: this.id })
  });

  getData = async (): Promise<ScriptData> => {
    if (this.pages) {
      this.pages.sort((a, b) => {
        if (!a.pageNo || !b.pageNo) {
          return 0;
        }
        return a.pageNo - b.pageNo;
      });
    }
    const pages =
      this.pages ||
      (await getRepository(Page).find({
        where: { scriptId: this.id },
        order: { pageNo: "ASC" }
      }));
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
