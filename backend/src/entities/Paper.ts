import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, OneToMany, getRepository } from "typeorm";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
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
  paperUsers?: PaperUser[];

  @OneToMany(type => ScriptTemplate, scriptTemplate => scriptTemplate.paper)
  scriptTemplates?: ScriptTemplate[];

  @OneToMany(type => Script, script => script.paper)
  scripts?: Script[];

  getListData = (role: PaperUserRole): PaperListData => ({
    ...this.getBase(),
    name: this.name,
    role
  });

  getData = async (role: PaperUserRole): Promise<PaperData> => {
    const paperUsers = await getRepository(PaperUser).find({
      where: { paper: this }
    });
    return {
      ...this.getListData(role),
      paperUsers: await Promise.all(
        paperUsers.map(async paperUser => await paperUser.getListData())
      )
    };
  };
}
