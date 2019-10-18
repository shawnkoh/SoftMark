import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";
import { Script } from "./Script";
import { PaperData, PaperListData } from "../types/papers";
import { PaperUserRole } from "../types/paperUsers";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
export class Paper extends Discardable {
  entityName = "Paper";

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @OneToMany(type => PaperUser, paperUser => paperUser.paper)
  paperUsers!: Promise<PaperUser[]>;

  @OneToMany(type => ScriptTemplate, scriptTemplate => scriptTemplate.paper)
  scriptTemplates!: Promise<ScriptTemplate[]>;

  @OneToMany(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.paper
  )
  questionTemplates!: Promise<QuestionTemplate[]>;

  @OneToMany(type => Script, script => script.paper)
  scripts!: Promise<Script[]>;

  getListData = (role: PaperUserRole): PaperListData => ({
    ...this.getBase(),
    name: this.name,
    role
  });

  getData = async (role: PaperUserRole): Promise<PaperData> => {
    const paperUsers = await this.paperUsers;
    return {
      ...this.getListData(role),
      paperUsers: paperUsers.map(paperUser => paperUser.getListData())
    };
  };
}
