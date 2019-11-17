import { IsOptional } from "class-validator";
import { Column } from "typeorm";
import { Base } from "./Base";

export abstract class Discardable extends Base {
  @Column({ type: "timestamp without time zone", nullable: true })
  @IsOptional()
  discardedAt!: Date | null;

  getBase = () => ({
    id: this.id,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    discardedAt: this.discardedAt
  });
}
