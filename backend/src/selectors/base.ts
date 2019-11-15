import { Base } from "../entities/Base";
import { SelectQueryBuilder } from "typeorm";
import { Discardable } from "../entities/Discardable";

// TODO: Inject directly into QueryBuilder so we dont need to use HOC

export function selectBaseData<Entity extends Base>(
  queryBuilder: SelectQueryBuilder<Entity>,
  entityName: string
) {
  return queryBuilder
    .select(`${entityName}.id`, "id")
    .addSelect(`${entityName}.createdAt`, "createdAt")
    .addSelect(`${entityName}.updatedAt`, "updatedAt");
}

export function selectDiscardableData<Entity extends Discardable>(
  queryBuilder: SelectQueryBuilder<Entity>,
  entityName: string,
  includeDiscarded: boolean = false
) {
  const query = selectBaseData(queryBuilder, entityName).addSelect(
    `${entityName}.discardedAt`,
    "discardedAt"
  );
  if (!includeDiscarded) {
    return query.where(`${entityName}.discardedAt IS NULL`);
  }
  return query;
}
