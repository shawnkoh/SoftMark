import { Entity, ManyToOne, Column, getRepository } from "typeorm";

import { Discardable } from "./Discardable";
import { Page } from "./Page";
import { PaperUser } from "./PaperUser";
import { AnnotationListData, AnnotationData } from "../types/annotations";

@Entity()
export class Annotation extends Discardable {
  entityName = "Annotation";

  constructor(page: Page, paperUser: PaperUser, layer: string) {
    super();
    this.page = page;
    this.paperUser = paperUser;
    this.layer = layer;
  }

  @Column()
  pageId!: number;

  @ManyToOne(type => Page, page => page.annotations)
  page?: Page;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.annotations)
  paperUser?: PaperUser;

  @Column({ type: "jsonb" })
  layer: string;

  getListData = (): AnnotationListData => {
    return {
      ...this.getBase(),
      pageId: this.pageId,
      paperUserId: this.paperUserId,
      layer: this.layer
    };
  };

  getData = async (): Promise<AnnotationData> => {
    this.page = await getRepository(Page).findOneOrFail(this.pageId);
    this.paperUser = await getRepository(PaperUser).findOneOrFail(
      this.paperUserId
    );

    return {
      ...this.getListData(),
      pageId: this.pageId,
      page: await this.page.getListData(),
      paperUserId: this.paperUserId,
      paperUser: await this.paperUser.getListData()
    };
  };
}
