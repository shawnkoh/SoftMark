import { IsNotEmpty, IsString } from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";
import { PaperData } from "../types/papers";
import { PaperUserRole } from "../types/paperUsers";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import { Script } from "./Script";
import { ScriptTemplate } from "./ScriptTemplate";

@Entity()
export class Paper extends Discardable {
  entityName = "Paper";

  constructor(name: string) {
    super();
    this.name = name;
  }

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

  getData = (role: PaperUserRole): PaperData => ({
    ...this.getBase(),
    name: this.name,
    role
  });
}
