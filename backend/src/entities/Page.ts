import { Entity, ManyToOne, OneToMany, Column } from "typeorm";
import { Annotation } from "./Annotation";
import { Discardable } from "./Discardable";
import { PageQuestion } from "./PageQuestion";
import { Script } from "./Script";

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
}
