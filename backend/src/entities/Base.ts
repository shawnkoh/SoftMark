import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

export abstract class Base {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  getBase = () => ({
    id: this.id,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  });

  abstract entityName: string;
}
