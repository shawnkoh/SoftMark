import { getRepository } from "typeorm";
import { Paper } from "../entities/Paper";
import { selectDiscardableData } from "./base";

const ENTITY_NAME = "paper";

export function selectPaperData(includeDiscarded: boolean = false) {
  const query = getRepository(Paper).createQueryBuilder(ENTITY_NAME);
  return selectDiscardableData(query, ENTITY_NAME, includeDiscarded)
    .addSelect(`${ENTITY_NAME}.name`, "name")
    .addSelect("paperUser.role", "role");
}
