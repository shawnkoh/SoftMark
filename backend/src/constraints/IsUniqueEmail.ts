import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { getRepository } from "typeorm";
import { User } from "../entities/User";

@ValidatorConstraint()
class IsUniqueEmail implements ValidatorConstraintInterface {
  async validate(name: string, args: ValidationArguments) {
    const user = args.object as User;

    const { email } = user;
    const queryBuilder = getRepository(User)
      .createQueryBuilder("user")
      .where("user.email = :email", { email });

    let count: number;
    if (user.id) {
      // edit an existing user
      count = await queryBuilder
        .andWhere("user.id != :id", { id: user.id })
        .getCount();
    } else {
      count = await queryBuilder.getCount();
    }

    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return "Duplicate questionTemplate, name";
  }
}

export default IsUniqueEmail;
