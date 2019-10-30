import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import {
  AnnotationPostData,
  AnnotationData
} from "backend/src/types/annotations";

class AnnotationsAPI extends BaseAPI {
  saveAnnotation(
    pageId: number,
    annotationPostData: AnnotationPostData
  ): Promise<AxiosResponse<{ annotation: AnnotationData }>> {
    return this.getClient().post(
      `/pages/${pageId}/annotations`,
      annotationPostData
    );
  }

  getOwnAnnotation(
    pageId: number
  ): Promise<AxiosResponse<{ annotation: AnnotationData }>> {
    return this.getClient().get(`/pages/${pageId}/annotations/self`);
  }

  private getUrl() {
    return "/annotations";
  }
}

export default AnnotationsAPI;
