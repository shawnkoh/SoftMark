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
