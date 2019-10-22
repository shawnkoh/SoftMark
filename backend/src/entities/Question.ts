import { Entity, ManyToOne, OneToMany, Column, Unique, getRepository } from "typeorm";
import { Bookmark } from "./Bookmark";
import { Comment } from "./Comment";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { PageQuestion } from "./PageQuestion";
import { QuestionTemplate } from "./QuestionTemplate";
import { Script } from "./Script";
import { QuestionListData, QuestionData } from "../types/questions";

@Entity()
@Unique(["script", "questionTemplate"])
export class Question extends Discardable {
  entityName = "Question";

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

  @OneToMany(type => PageQuestion, pageQuestion => pageQuestion.question)
  pageQuestions?: PageQuestion[];

  @OneToMany(type => Mark, mark => mark.question)
  marks?: Mark[];

  @OneToMany(type => Bookmark, bookmark => bookmark.question)
  bookmarks?: Bookmark[];

  @OneToMany(type => Comment, comment => comment.question)
  comments?: Comment[];

  retrieveFromRepostitory = async (): Promise<void> => {
    this.questionTemplate = await getRepository(QuestionTemplate).findOneOrFail(
      this.questionTemplateId
    );
    this.script = await getRepository(Script).findOneOrFail(this.scriptId);
    this.pageQuestions = await getRepository(PageQuestion).find({
      questionId: this.id
    });
    this.marks = await getRepository(Mark).find({ questionId: this.id });
    this.bookmarks = await getRepository(Bookmark).find({
      questionId: this.id
    });
    this.comments = await getRepository(Comment).find({ questionId: this.id });
  };

  getListData = async (): Promise<QuestionListData> => {
    this.pageQuestions = await getRepository(PageQuestion).find({
      questionId: this.id
    });
    this.marks = await getRepository(Mark).find({ questionId: this.id });
    this.bookmarks = await getRepository(Bookmark).find({
      questionId: this.id
    });
    this.comments = await getRepository(Comment).find({ questionId: this.id });
    return {
      ...this.getBase(),
      questionTemplateId: this.questionTemplateId,
      scriptId: this.scriptId,
      pageQuestionsCount: this.pageQuestions.length,
      marksCount: this.marks.length,
      bookmarksCount: this.bookmarks.length
    };
  };

  getData = async (): Promise<QuestionData> => {
    this.questionTemplate = await getRepository(QuestionTemplate).findOneOrFail(
      this.questionTemplateId
    );
    this.script = await getRepository(Script).findOneOrFail(this.scriptId);
    this.pageQuestions = await getRepository(PageQuestion).find({
      questionId: this.id
    });
    this.marks = await getRepository(Mark).find({ questionId: this.id });
    this.bookmarks = await getRepository(Bookmark).find({
      questionId: this.id
    });
    this.comments = await getRepository(Comment).find({
      questionId: this.id
    });
    return {
      ...this.getBase(),
      questionTemplateId: this.questionTemplateId,
      scriptId: this.scriptId,
      pageQuestionsCount: this.pageQuestions.length,
      pageQuestions: await Promise.all(
        this.pageQuestions.map(pageQuestion => pageQuestion.getListData())
      ),
      marksCount: this.marks.length,
      marks: await Promise.all(this.marks.map(mark => mark.getListData())),
      bookmarksCount: this.bookmarks.length,
      bookmarks: await Promise.all(
        this.bookmarks.map(bookmark => bookmark.getListData())
      )
    };
  };
}
