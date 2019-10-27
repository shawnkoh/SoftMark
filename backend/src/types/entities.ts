export interface BaseData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscardableData extends BaseData {
  discardedAt: Date | null;
}

// Do not use object instanceof Date
// See https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
export function isValidDate(date: any): date is Date {
  // API calls returns JSON. JSON cannot contain a Date
  // So, convert the string to a Date before testing it.
  if (typeof date === "string") {
    date = new Date(date);
  }

  return (
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date)
  );
}

export function isBaseData(data: any): data is BaseData {
  return (
    typeof data.id === "number" &&
    isValidDate(data.createdAt) &&
    isValidDate(data.updatedAt)
  );
}

export function isDiscardableData(data: any): data is DiscardableData {
  return (
    (data.discardedAt === null || isValidDate(data.discardedAt)) &&
    isBaseData(data)
  );
}
