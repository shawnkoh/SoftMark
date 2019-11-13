import { AxiosResponse } from "axios";
import {
  AnnotationData,
  AnnotationPostData
} from "backend/src/types/annotations";
import client from "./client";

const URL = "/annotations";

export async function saveAnnotation(
  pageId: number,
  data: AnnotationPostData
): Promise<AxiosResponse<{ annotation: AnnotationData }>> {
  return client.put(`/pages/${pageId}/annotations`, data);
}

export async function getOwnAnnotation(
  pageId: number
): Promise<AxiosResponse<{ annotation: AnnotationData }>> {
  return client.get(`/pages/${pageId}/annotations/self`);
}
