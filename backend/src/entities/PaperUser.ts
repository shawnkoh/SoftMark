import { IsNotEmpty, IsEnum, IsString, IsOptional } from "class-validator";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  getRepository,
  Unique
} from "typeorm";
import { Allocation } from "./Allocation";
import { Annotation } from "./Annotation";
import { Bookmark } from "./Bookmark";
import { Comment } from "./Comment";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { Paper } from "./Paper";
import { Question } from "./Question";
import { Script } from "./Script";
import { User } from "./User";
import {
  PaperUserRole,
  PaperUserListData,
  PaperUserData
} from "../types/paperUsers";

@Entity()
@Unique(["paper", "user"])
export class PaperUser extends Discardable {
  entityName = "PaperUser";

  constructor(
    paper: Paper | number,
    user: User | number,
    role: PaperUserRole,
    matriculationNumber?: string | null
  ) {
    super();
    if (typeof paper === "number") {
      this.paperId = paper;
    } else {
      this.paper = paper;
    }
    if (typeof user === "number") {
      this.userId = user;
    } else {
      this.user = user;
    }
    this.role = role;
    this.matriculationNumber = matriculationNumber ? matriculationNumber.toUpperCase() : null;
  }

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper?: Paper;

  @Column()
  userId!: number;

  @ManyToOne(type => User, user => user.paperUsers, { eager: true })
  user?: User;

  @Column({
    type: "enum",
    enum: PaperUserRole
  })
  @IsNotEmpty()
  @IsEnum(PaperUserRole)
  role!: PaperUserRole;

  @Column({ type: "varchar", nullable: true })
  @IsOptional()
  @IsString()
  matriculationNumber: string | null;

  @OneToMany(type => Allocation, allocation => allocation.paperUser)
  allocations?: Allocation[];

  @OneToMany(type => Annotation, annotation => annotation.paperUser)
  annotations?: Annotation[];

  @OneToMany(type => Mark, mark => mark.marker, { eager: true })
  marks?: Mark[];

  @OneToMany(type => Bookmark, bookmark => bookmark.paperUser, { eager: true })
  bookmarks?: Bookmark[];

  @OneToMany(type => Comment, comment => comment.paperUser)
  comments?: Comment[];

  @OneToMany(type => Script, script => script.student)
  scripts?: Script[];

  @OneToMany(type => Question, question => question.currentMarker)
  questionsBeingMarked?: Question[];

  getListData = async (): Promise<PaperUserListData> => ({
    ...this.getBase(),
    user: this.user
      ? this.user.getData()
      : (await getRepository(User).findOneOrFail(this.userId)).getData(),
    role: this.role,
    matriculationNumber: this.matriculationNumber,
    allocations:
      this.allocations ||
      (await getRepository(Allocation).find({
        where: { paperUser: this.id }
      })),
    markCount: this.marks
      ? this.marks.length
      : await getRepository(Mark).count({
          where: { paperUser: this.id }
        }),
    bookmarkCount: this.bookmarks
      ? this.bookmarks.length
      : await getRepository(Bookmark).count({
          where: { paperUser: this.id }
        })
  });

  getData = async (): Promise<PaperUserData> => ({
    ...(await this.getListData())
  });
}
