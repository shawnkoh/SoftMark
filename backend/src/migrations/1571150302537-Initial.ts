import { MigrationInterface, QueryRunner, getRepository } from "typeorm";

import { User } from "../entities/User";

export class Initial1571150302537 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await getRepository(User).save([
      new User("shawnkoh@me.com", "setMeUp?"),
      new User("shawnkoh@u.nus.edu", "setMeUp?"),
      new User("ooimingsheng@gmail.com", "setMeUp?"),
      new User("rlrh1996@gmail.com", "setMeUp?"),
      new User("fungsiqi07@gmail.com", "setMeUp?")
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
