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

interface withPageInfo {
  topOffset: number | null;
  leftOffset: number | null;
  displayPage: number | null;
  name: string;
}

export function sortByPageInfo<A extends withPageInfo, B extends withPageInfo>(
  a: A,
  b: B
) {
  const displayPageA = a.displayPage || 0;
  const displayPageB = b.displayPage || 0;
  const topOffsetA = a.topOffset || 0;
  const topOffsetB = b.topOffset || 0;
  const leftOffsetA = a.leftOffset || 0;
  const leftOffsetB = b.leftOffset || 0;
  const nameA = a.name.toLocaleLowerCase();
  const nameB = b.name.toLocaleLowerCase();

  if (displayPageA !== displayPageB) {
    return displayPageA - displayPageB;
  } else if (topOffsetA !== topOffsetB) {
    return topOffsetA - topOffsetB;
  } else if (leftOffsetA !== leftOffsetB) {
    return leftOffsetA - leftOffsetB;
  } else {
    return nameA.localeCompare(nameB);
  }
}

interface withCreatedAt {
  createdAt: Date;
}

export function sortByCreatedAt<
  A extends withCreatedAt,
  B extends withCreatedAt
>(a: A, b: B) {
  return a.createdAt.getTime() - b.createdAt.getTime();
}
