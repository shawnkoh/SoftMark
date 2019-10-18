import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
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
  paper!: Promise<Paper>;

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.scriptTemplate
  )
  questionTemplates!: Promise<QuestionTemplate[]>;

  getData = async (): Promise<ScriptTemplateData> => {
    const questionTemplates = await this.questionTemplates;
    return {
      ...this.getBase(),
      questionTemplates: questionTemplates.map(questionTemplate =>
        questionTemplate.getListData()
      )
    };
  };
}
