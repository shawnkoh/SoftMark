import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from "class-validator";
import { getRepository, IsNull } from "typeorm";

import { Script } from "../entities/Script";

@ValidatorConstraint()
class IsUniqueFilename implements ValidatorConstraintInterface {
  async validate(filename: string, args: ValidationArguments) {
    const paperId = (args.object as any)["paperId"];
    const script = await getRepository(Script).findOne({
      paperId,
      filename,
      discardedAt: IsNull()
    });
    return !script;
  }

  defaultMessage(args: ValidationArguments) {
    return "Duplicate paper, filename";
  }
}

export default IsUniqueFilename;
