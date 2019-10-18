export interface QuestionTemplateListData {
  id: number;
  name: string;
  marks: number;
  createdAt: Date;
  updatedAt: Date;
  discardedAt?: Date;
}

export interface QuestionTemplateData extends QuestionTemplateListData {

}