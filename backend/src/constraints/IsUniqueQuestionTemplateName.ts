import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { getRepository } from "typeorm";
import { ScriptTemplate } from "../entities/ScriptTemplate";

@ValidatorConstraint()
class IsUniqueQuestionTemplateName implements ValidatorConstraintInterface {
  async validate(name: string, args: ValidationArguments) {
    const scriptTemplateId = (args.object as any)["scriptTemplate"].id;
    const count = await getRepository(ScriptTemplate)
      .createQueryBuilder("scriptTemplate")
      .where("scriptTemplate.id = :id", { id: scriptTemplateId })
      .innerJoin("scriptTemplate.questionTemplates", "questionTemplate")
      .andWhere("questionTemplate.discardedAt is null")
      .andWhere("questionTemplate.name = :name", { name })
      .getCount();
    return count === 0;
  }

  defaultMessage(args: ValidationArguments) {
    return "Duplicate questionTemplate, name";
  }
}

export default IsUniqueQuestionTemplateName;
