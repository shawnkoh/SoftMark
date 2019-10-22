import { Entity, ManyToOne, OneToMany, Column, getRepository } from "typeorm";
import { Annotation } from "./Annotation";
import { Discardable } from "./Discardable";
import { PageQuestion } from "./PageQuestion";
import { Script } from "./Script";
import { PageListData, PageData } from "../types/pages";

@Entity()
export class Page extends Discardable {
  entityName = "Page";

  @Column()
  scriptId!: number;

  @ManyToOne(type => Script, script => script.pages)
  script?: Script;

  @OneToMany(type => PageQuestion, pageQuestion => pageQuestion.page)
  pageQuestions?: PageQuestion[];

  @OneToMany(type => Annotation, annotation => annotation.page)
  annotations?: Annotation[];

  retrieveFromRepostitory = async (): Promise<void> => {
    this.script = await getRepository(Script).findOneOrFail(this.scriptId);
    this.pageQuestions = await getRepository(PageQuestion).find({
      pageId: this.id
    });
    this.annotations = await getRepository(Annotation).find({
      pageId: this.id
    });
  };

  getListData = async (): Promise<PageListData> => {
    this.script = await getRepository(Script).findOneOrFail(this.scriptId);
    this.pageQuestions = await getRepository(PageQuestion).find({
      pageId: this.id
    });
    this.annotations = await getRepository(Annotation).find({
      pageId: this.id
    });

    return {
      ...this.getBase(),
      scriptId: this.scriptId,
      pageQuestionsCount: this.pageQuestions.length,
      annotationsCount: this.annotations.length
    };
  };

  getData = async (): Promise<PageData> => {
    this.script = await getRepository(Script).findOneOrFail(this.scriptId);
    this.pageQuestions = await getRepository(PageQuestion).find({
      pageId: this.id
    });
    this.annotations = await getRepository(Annotation).find({
      pageId: this.id
    });

    return {
      ...this.getBase(),
      scriptId: this.scriptId,
      pageQuestionsCount: this.pageQuestions.length,
      pageQuestions: await Promise.all(
        this.pageQuestions.map(pageQuestion => pageQuestion.getListData())
      ),
      annotationsCount: this.annotations.length,
      annotations: await Promise.all(
        this.annotations.map(annotation => annotation.getListData())
      )
    };
  };
}
