import { SelectQueryBuilder } from "typeorm";
import { Base } from "../entities/Base";
import { selectBaseData } from "./base";

const ENTITY_NAME = "allocation";

// This should just be selectAllocationData - I dont think AllocationListData is a necessary type
export function selectAllocationListData<Entity extends Base>(
  query: SelectQueryBuilder<Entity>,
  overwite: boolean = true
) {
  return selectBaseData(query, ENTITY_NAME)
    .addSelect(`${ENTITY_NAME}.questionTemplateId`, "questionTemplateId")
    .addSelect(`${ENTITY_NAME}.paperUserId`, "paperUserId");
}
