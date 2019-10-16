import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import { hashSync } from "bcryptjs";
import { User } from "../entities/User";

export class Initial1571150302537 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      await getRepository(User).save([
        createUser("shawnkoh@me.com"),
        createUser("ooimingsheng@gmail.com"),
        createUser("rlrh1996@gmail.com"),
        createUser("fungsiqi07@gmail.com"),
      ]);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}

function createUser(email: string): User {
  let user = new User();
  user.password = hashSync("setMeUp?");
  user.email = email;
  user.emailVerified = true;
  return user;
}
