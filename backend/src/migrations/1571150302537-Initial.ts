import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1571150302537 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    // TODO: Don't rely on sync, instead, should Build all required tables
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
