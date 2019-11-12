import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { getRepository } from "typeorm";
import QuestionTemplate from "../entities/QuestionTemplate";
import { ScriptTemplate } from "../entities/ScriptTemplate";

@ValidatorConstraint()
class IsUniqueQuestionTemplateName implements ValidatorConstraintInterface {
  async validate(name: string, args: ValidationArguments) {
    const questionTemplate = args.object as QuestionTemplate;
    let { scriptTemplate } = questionTemplate;
    if (!scriptTemplate) {
      console.error(
        "IsUniqueQuestionTemplate expects scriptTemplate to be loaded"
      );
      return false;
    }
    const scriptTemplateId = scriptTemplate.id;

    const queryBuilder = getRepository(ScriptTemplate)
      .createQueryBuilder("scriptTemplate")
      .where("scriptTemplate.id = :id", { id: scriptTemplateId })
      .innerJoin("scriptTemplate.questionTemplates", "questionTemplate")
      .andWhere("questionTemplate.discardedAt is null")
      .andWhere("questionTemplate.name = :name", { name });

    let count: number;
    if (questionTemplate.id) {
      // editing an existing questionTemplate
      count = await queryBuilder
        .andWhere("questionTemplate.id != :id", {
          id: questionTemplate.id
        })
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

export default IsUniqueQuestionTemplateName;
