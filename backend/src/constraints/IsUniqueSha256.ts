import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments
} from "class-validator";
import { getRepository, IsNull } from "typeorm";

import { Script } from "../entities/Script";

@ValidatorConstraint()
class IsUniqueSha256 implements ValidatorConstraintInterface {
  async validate(sha256: string, args: ValidationArguments) {
    const paperId = (args.object as any)["paperId"];
    const script = await getRepository(Script).findOne({
      paperId,
      sha256,
      discardedAt: IsNull()
    });
    return !script;
  }

  defaultMessage(args: ValidationArguments) {
    return "Duplicate paper, sha256";
  }
}

export default IsUniqueSha256;
