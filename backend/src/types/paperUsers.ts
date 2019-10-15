export enum PaperUserRole {
  Owner = "OWNER",
  Examiner = "EXAMINER",
  Marker = "MARKER",
  Student = "STUDENT"
}

export function isPaperUserRole(role: any): role is PaperUserRole {
  return Object.values(PaperUserRole).includes(role);
}
