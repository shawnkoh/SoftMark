import { AxiosResponse } from "axios";
import {
  QuestionTemplateListData,
  QuestionTemplateData,
  QuestionTemplatePostData,
  QuestionTemplatePatchData
} from "backend/src/types/questionTemplates";
import client from "./client";

const URL = "/question_templates";

export async function createQuestionTemplate(
  id: number,
  QuestionTemplatePostData: QuestionTemplatePostData
): Promise<AxiosResponse<{ questionTemplate: QuestionTemplateData }>> {
  return client.post(
    `/script_templates/${id}/question_templates`,
    QuestionTemplatePostData
  );
}

export async function getQuestionTemplates(
  id: number
): Promise<AxiosResponse<{ questionTemplates: QuestionTemplateListData[] }>> {
  return client.get(`papers/${id}/question_templates`);
}

export async function getQuestionTemplate(
  id: number
): Promise<AxiosResponse<{ questionTemplate: QuestionTemplateData }>> {
  return client.get(`${URL}/${id}`);
}

export async function discardQuestionTemplate(
  id: number
): Promise<AxiosResponse> {
  return client.delete(`${URL}/${id}`);
}

export async function undiscardQuestionTemplate(
  id: number
): Promise<AxiosResponse<{ questionTemplate: QuestionTemplateData }>> {
  return client.patch(`${URL}/${id}/undiscard`);
}

export async function editQuestionTemplate(
  id: number,
  questionPatchData: QuestionTemplatePatchData
): Promise<AxiosResponse<{ questionTemplate: QuestionTemplateData }>> {
  return client.patch(`${URL}/${id}`, questionPatchData);
}
