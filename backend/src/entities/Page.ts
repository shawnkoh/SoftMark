import { Column, Entity, getRepository, ManyToOne, OneToMany } from "typeorm";
import { PageData, PageListData } from "../types/pages";
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

  getListData = async (): Promise<PageListData> => ({
    ...this.getBase(),
    scriptId: this.scriptId,
    pageNo: this.pageNo ? this.pageNo : -1,
    imageUrl: this.imageUrl ? this.imageUrl : "",
    annotationsCount: this.annotations
      ? this.annotations.length
      : await getRepository(Annotation).count({ pageId: this.id })
  });

  getData = async (): Promise<PageData> => {
    const annotations =
      this.annotations ||
      (await getRepository(Annotation).find({ pageId: this.id }));

    return {
      ...(await this.getListData()),
      scriptId: this.scriptId,
      annotations: await Promise.all(
        annotations.map(annotation => annotation.getListData())
      )
    };
  };
}
