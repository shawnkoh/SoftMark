import { IsNotEmpty, IsEnum } from "class-validator";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Allocation } from "./Allocation";
import { Bookmark } from "./Bookmark";
import { Comment } from "./Comment";
import { Discardable } from "./Discardable";
import { Mark } from "./Mark";
import { Paper } from "./Paper";
import { PaperUserRole } from "../types/paperUsers";
import { User } from "./User";

@Entity()
export class PaperUser extends Discardable {
  entityName = "PaperUser";

  @ManyToOne(type => Paper, paper => paper.paperUsers)
  paper!: Paper;

  @ManyToOne(type => User, user => user.paperUsers)
  user!: User;

  @Column({
    type: "enum",
    enum: PaperUserRole
  })
  @IsNotEmpty()
  @IsEnum(PaperUserRole)
  role!: PaperUserRole;

  @OneToMany(type => Allocation, allocation => allocation.paperUser)
  allocations!: Allocation[];

  @OneToMany(type => Mark, mark => mark.paperUser)
  marks!: Mark[];

  @OneToMany(type => Bookmark, bookmark => bookmark.paperUser)
  bookmarks!: Bookmark[];

  @OneToMany(type => Comment, comment => comment.paperUser)
  comments!: Comment[];
}
