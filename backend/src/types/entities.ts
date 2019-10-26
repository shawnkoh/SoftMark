export interface BaseData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export function isBaseData(data: any): data is BaseData {
  return (
    typeof data.id === "number" &&
    data.createdAt instanceof Date &&
    data.updatedAt instanceof Date
  );
}

export interface DiscardableData extends BaseData {
  discardedAt: Date | null;
}

export function isDiscardableData(data: any): data is DiscardableData {
  return (
    (data.discardedAt instanceof Date || data.discardedAt === null) &&
    isBaseData(data)
  );
}
