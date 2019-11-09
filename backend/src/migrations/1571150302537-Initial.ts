import { MigrationInterface, QueryRunner, getRepository } from "typeorm";

import { User } from "../entities/User";

export class Initial1571150302537 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await getRepository(User).save([
      new User("shawnkoh@me.com"),
      new User("ooimingsheng@gmail.com"),
      new User("rlrh1996@gmail.com"),
      new User("fungsiqi07@gmail.com")
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
