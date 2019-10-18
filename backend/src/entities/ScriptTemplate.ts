import { Column, Entity, ManyToOne, OneToMany, getRepository } from "typeorm";
import { Discardable } from "./Discardable";
import { Paper } from "./Paper";
import { QuestionTemplate } from "./QuestionTemplate";
import { ScriptTemplateData } from "../types/scriptTemplates";

@Entity()
export class ScriptTemplate extends Discardable {
  entityName = "ScriptTemplate";

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.scriptTemplates)
  paper?: Paper;

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.scriptTemplate
  )
  questionTemplates?: QuestionTemplate[];

  getData = async (): Promise<ScriptTemplateData> => {
    const questionTemplates =
      this.questionTemplates ||
      (await getRepository(QuestionTemplate).find({
        where: { scriptTemplate: this }
      }));
    return {
      ...this.getBase(),
      questionTemplates: questionTemplates.map(questionTemplate =>
        questionTemplate.getListData()
      )
    };
  };
}
