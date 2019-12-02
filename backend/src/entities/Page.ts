import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { PageListData } from "../types/pages";
import { Annotation } from "./Annotation";
import { Discardable } from "./Discardable";
import { Script } from "./Script";

@Entity()
export class Page extends Discardable {
  entityName = "Page";

  constructor(script: Script, imageUrl: string, pageNo: number) {
    super();
    this.script = script;
    this.imageUrl = imageUrl;
    this.pageNo = pageNo;
  }

  @Column()
  scriptId!: number;

  @ManyToOne(type => Script, script => script.pages)
  script?: Script;

  @Column({ type: "character varying" })
  imageUrl!: string;

  @Column({ type: "int" })
  pageNo!: number;

  @OneToMany(type => Annotation, annotation => annotation.page)
  annotations?: Annotation[];

  getListData = (): PageListData => ({
    ...this.getBase(),
    pageNo: this.pageNo || -1,
    imageUrl: this.imageUrl || ""
  });
}
