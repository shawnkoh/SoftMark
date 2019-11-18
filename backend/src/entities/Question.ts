import { IsOptional } from "class-validator";
import {
  Column,
  Entity,
  getRepository,
  ManyToOne,
  OneToMany,
  Unique
} from "typeorm";
import { QuestionListData } from "../types/questions";
import { Bookmark } from "./Bookmark";
import { Comment } from "./Comment";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { PaperUser } from "./PaperUser";
import { QuestionTemplate } from "./QuestionTemplate";
import { Script } from "./Script";

@Entity()
@Unique(["script", "questionTemplate"])
export class Question extends Discardable {
  entityName = "Question";

  constructor(script: Script, questionTemplate: QuestionTemplate) {
    super();
    this.script = script;
    this.questionTemplate = questionTemplate;
  }

  @Column()
  questionTemplateId!: number;

  @ManyToOne(
    type => QuestionTemplate,
    questionTemplate => questionTemplate.questions
  )
  questionTemplate?: QuestionTemplate;

  @Column()
  scriptId!: number;

  @ManyToOne(type => Script, script => script.questions)
  script?: Script;

  // Flag to prevent other markers from marking at the same time
  @Column({ nullable: true })
  currentMarkerId!: number | null;

  @ManyToOne(
    type => PaperUser,
    currentMarker => currentMarker.questionsBeingMarked
  )
  currentMarker?: PaperUser | null;

  @Column({ type: "timestamp without time zone", nullable: true })
  @IsOptional()
  currentMarkerUpdatedAt!: Date | null;

  @OneToMany(type => Mark, mark => mark.question)
  marks?: Mark[];

  @OneToMany(type => Bookmark, bookmark => bookmark.question)
  bookmarks?: Bookmark[];

  @OneToMany(type => Comment, comment => comment.question)
  comments?: Comment[];

  getListData = async (): Promise<QuestionListData> => {
    // inherit parent's discarded at - see DEVELOPER.md
    let discardedAt = this.discardedAt;
    if (!discardedAt) {
      const questionTemplate =
        this.questionTemplate ||
        (await getRepository(QuestionTemplate).findOneOrFail(
          this.questionTemplateId
        ));
      discardedAt = questionTemplate.discardedAt;
    }

    return {
      ...this.getBase(),
      discardedAt,
      questionTemplateId: this.questionTemplateId,
      scriptId: this.scriptId,
      currentMarkerId: this.currentMarkerId,
      currentMarkerUpdatedAt: this.currentMarkerUpdatedAt,
      marksCount: this.marks
        ? this.marks.length
        : await getRepository(Mark).count({ questionId: this.id }),
      bookmarksCount: this.bookmarks
        ? this.bookmarks.length
        : await getRepository(Bookmark).count({ questionId: this.id })
    };
  };
}
