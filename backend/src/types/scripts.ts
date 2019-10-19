import { DiscardableData } from "./entities";
import { QuestionListData } from "./questions";

export interface ScriptPostData {
  email: string,
}

export interface ScriptListData extends DiscardableData {

}

export interface ScriptData extends ScriptListData {
  questions: QuestionListData[];
}