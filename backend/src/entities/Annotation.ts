import { Entity, ManyToOne, Column, getRepository } from "typeorm";

import { Base } from "./Base";
import { Page } from "./Page";
import { PaperUser } from "./PaperUser";
import { AnnotationLine, AnnotationListData, AnnotationData } from "../types/annotations";

@Entity()
export class Annotation extends Base {
  entityName = "Annotation";

  constructor(page: Page, paperUser: PaperUser, layer: AnnotationLine[]) {
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
  layer: AnnotationLine[];

  getListData = (): AnnotationListData => {
    return {
      ...this.getBase(),
      pageId: this.pageId,
      paperUserId: this.paperUserId,
      layer: this.layer
    };
  };

  getData = async (): Promise<AnnotationData> => {
    const page =
      this.page || (await getRepository(Page).findOneOrFail(this.pageId));
    const paperUser =
      this.paperUser ||
      (await getRepository(PaperUser).findOneOrFail(this.paperUserId));

    return {
      ...this.getListData(),
      page: await page.getListData(),
      paperUser: await paperUser.getListData()
    };
  };
}
