import { AxiosResponse } from "axios";
import { ScriptViewData } from "backend/src/types/view";
import {
  QuestionTemplateData,
  QuestionTemplatePatchData,
  QuestionTemplatePostData
} from "backend/src/types/questionTemplates";
import client from "./client";

const URL = "/question_templates";

export async function createQuestionTemplate(
  id: number,
  postData: QuestionTemplatePostData
): Promise<AxiosResponse<{ questionTemplate: QuestionTemplateData }>> {
  return client.post(`/script_templates/${id}/question_templates`, postData);
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

/**
 * Only accessible to Marker
 */
export async function getQuestionToMark(id: number) {
  try {
    const { data } = await client.get<ScriptViewData>(
      `${URL}/${id}/question_to_mark`
    );
    return data;
  } catch (error) {
    return null;
  }
}
