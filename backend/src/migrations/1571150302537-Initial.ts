import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1571150302537 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    queryRunner.query(
      'CREATE UNIQUE INDEX mark_unique_constraint ON mark ("questionId", "markerId") WHERE mark."discardedAt" IS NULL'
    );
    // TODO: Don't rely on sync, instead, should Build all required tables
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
