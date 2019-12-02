import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Discardable } from "./Discardable";
import { Page } from "./Page";
import { Paper } from "./Paper";
import { PaperUser } from "./PaperUser";
import { Question } from "./Question";
@Entity()
export class Script extends Discardable {
  entityName = "Script";

  constructor(
    paper: number | Paper,
    filename: string,
    sha256: string,
    pageCount: number,
    student?: number | PaperUser,
    publishedDate?: Date | null
  ) {
    super();
    if (typeof paper === "number") {
      this.paperId = paper;
    } else {
      this.paper = paper;
    }
    this.filename = filename ? filename.toUpperCase() : filename;
    this.sha256 = sha256;
    if (!student) {
      this.studentId = null;
      this.student = null;
    } else if (typeof student === "number") {
      this.studentId = student;
    } else {
      this.student = student;
    }
    this.pageCount = pageCount;
    this.hasVerifiedStudent = false;
    this.publishedDate = publishedDate || null;
  }

  @Column()
  paperId!: number;

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper?: Paper;

  @Column()
  @IsNotEmpty()
  @IsString()
  // @Validate(IsUniqueFilename)
  filename: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  // @Validate(IsUniqueSha256)
  sha256: string;

  @Column({ nullable: true })
  @IsOptional()
  studentId!: number | null;

  @ManyToOne(type => PaperUser, student => student.scripts)
  student?: PaperUser | null;

  @Column("boolean")
  @IsNotEmpty()
  hasVerifiedStudent: boolean;

  @Column({ type: "int" })
  pageCount: number;

  @Column({ type: "timestamp without time zone", nullable: true })
  publishedDate: Date | null;

  @OneToMany(type => Page, page => page.script)
  pages?: Page[];

  @OneToMany(type => Question, question => question.script)
  questions?: Question[];
}
