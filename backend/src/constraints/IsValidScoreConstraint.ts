import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from "class-validator";
import { getRepository } from "typeorm";
import { Question } from "../entities/Question";
import QuestionTemplate from "../entities/QuestionTemplate";

@ValidatorConstraint({ name: "IsValidScore", async: true })
class IsValidScoreConstraint implements ValidatorConstraintInterface {
  async validate(score: number, args: ValidationArguments) {
    const questionId = (args.object as any)["questionId"];
    const question: Question =
      (args.object as any)["question"] ||
      (await getRepository(Question).findOneOrFail(questionId, {
        relations: ["questionTemplate"]
      }));
    const questionTemplate =
      question.questionTemplate ||
      (await getRepository(QuestionTemplate).findOneOrFail(
        question.questionTemplateId
      ));
    if (!questionTemplate.score || score > questionTemplate.score) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Invalid score";
  }
}

export default IsValidScoreConstraint;
