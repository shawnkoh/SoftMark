import { validateOrReject } from "class-validator";

export async function getEntityArray<T, U>(
  source: T[],
  constructor: new () => U,
  args?: any
): Promise<U[]> {
  // Awaiting a Promise.all unrolls all internal promises in the array, throwing necessary errors
  return await Promise.all(
    source.map(async data => {
      const combinedData = { ...data, ...args };
      const val = Object.assign(new constructor(), combinedData);
      await validateOrReject(val);
      return val;
    })
  );
}
