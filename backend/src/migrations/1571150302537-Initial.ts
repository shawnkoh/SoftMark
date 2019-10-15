import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import { hashSync } from "bcryptjs";
import { User } from "../entities/User";
import { UserRole } from "../types/users";

export class Initial1571150302537 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      await getRepository(User).save([
        createAdmin("shawnkoh@me.com"),
        createAdmin("ooimingsheng@gmail.com"),
        createAdmin("rlrh1996@gmail.com"),
        createAdmin("fungsiqi07@gmail.com"),
      ]);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}

function createAdmin(email: string): User {
  let user = new User();
  user.password = hashSync("setMeUp?");
  user.email = email;
  user.emailVerified = true;
  user.role = UserRole.Admin;
  return user;
}
