export interface BaseData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscardableData extends BaseData {
  discardedAt: Date | null;
}
