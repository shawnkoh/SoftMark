import { AllocationData } from "allocations";
import { PaperUserListData } from "paperUsers";
import { PaperUser } from "../entities/PaperUser";

interface withPageNo {
  pageNo: number;
}

export function sortByPageNo<A extends withPageNo, B extends withPageNo>(
  a: A,
  b: B
) {
  return a.pageNo - b.pageNo;
}

interface withFilename {
  filename: string;
}

export function sortByFilename<A extends withFilename, B extends withFilename>(
  a: A,
  b: B
) {
  return a.filename.toUpperCase().localeCompare(b.filename.toUpperCase());
}

interface withOptionalMatricNo {
  matriculationNumber?: string;
}

export function sortByMatricNo(a: PaperUser, b: PaperUser) {
  const matricA = a.matriculationNumber ? a.matriculationNumber : "";
  const matricB = b.matriculationNumber ? b.matriculationNumber : "";
  return matricA.toUpperCase().localeCompare(matricB.toUpperCase());
}

export function sortPaperUserByName(
  a: PaperUserListData,
  b: PaperUserListData
) {
  const nameA = a.user.name ? a.user.name : "";
  const nameB = b.user.name ? b.user.name : "";
  return nameA.toUpperCase().localeCompare(nameB.toUpperCase());
}

export function sortAllocationsByQuestionNameThenPaperUserName(
  a: AllocationData,
  b: AllocationData
) {
  const questionNameA = a.questionTemplate.name.toLocaleUpperCase();
  const questionNameB = b.questionTemplate.name.toLocaleUpperCase();

  const paperUserNameA = (a.paperUser.user.name
    ? a.paperUser.user.name
    : ""
  ).toUpperCase();
  const paperUserNameB = (b.paperUser.user.name
    ? b.paperUser.user.name
    : ""
  ).toUpperCase();

  return questionNameA !== questionNameB
    ? questionNameA.localeCompare(questionNameB)
    : paperUserNameA.localeCompare(paperUserNameB);
}
