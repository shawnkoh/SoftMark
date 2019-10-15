import { Column } from "typeorm";
import { Base } from "./Base";
import { IsOptional } from "class-validator";

export abstract class Discardable extends Base {
  @Column({ nullable: true })
  @IsOptional()
  discardedAt?: Date;
}
