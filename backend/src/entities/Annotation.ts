import { Entity, ManyToOne, Column, getRepository } from "typeorm";
import { PaperUser } from "./PaperUser";
import { Page } from "./Page";
import { AnnotationListData, AnnotationData } from "../types/annotations";
import { Discardable } from "./Discardable";

@Entity()
export class Annotation extends Discardable {
  entityName = "Annotation";

  @Column()
  pageId!: number;

  @ManyToOne(type => Page, page => page.annotations)
  page?: Page;

  @Column()
  paperUserId!: number;

  @ManyToOne(type => PaperUser, paperUser => paperUser.annotations)
  paperUser?: PaperUser;

  retrieveFromRepostitory = async (): Promise<void> => {
    this.page = await getRepository(Page).findOneOrFail(this.pageId);
    this.paperUser = await getRepository(PaperUser).findOneOrFail(
      this.paperUserId
    );
  };

  getListData = async (): Promise<AnnotationListData> => {
    return {
      ...this.getBase(),
      pageId: this.pageId,
      paperUserId: this.paperUserId
    };
  };

  getData = async (): Promise<AnnotationData> => {
    this.page = await getRepository(Page).findOneOrFail(this.pageId);
    this.paperUser = await getRepository(PaperUser).findOneOrFail(
      this.paperUserId
    );

    return {
      ...this.getBase(),
      pageId: this.pageId,
      page: await this.page.getListData(),
      paperUserId: this.paperUserId,
      paperUser: await this.paperUser.getListData()
    };
  };
}
