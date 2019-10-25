import { PaperUserRole } from "backend/src/types/paperUsers";

export interface OptionsType<V = number | string> {
  value: V;
  label: string;
}

export type Options<V = number | string> = Array<OptionsType<V>>;

export function optionsToNameMap(options: Options): Record<string, string> {
  const mapping: Record<string, string> = {};
  options.forEach(option => (mapping[option.value] = option.label));
  return Object.freeze(mapping);
}

export const PAPER_USER_ROLE_OPTIONS: Options<PaperUserRole> = [
  { value: PaperUserRole.Owner, label: "Owner" },
  { value: PaperUserRole.Marker, label: "Marker" },
  { value: PaperUserRole.Student, label: "Student" }
];

export const PAPER_USER_ROLE_NAMES = optionsToNameMap(PAPER_USER_ROLE_OPTIONS);
