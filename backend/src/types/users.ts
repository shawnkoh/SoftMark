export enum UserRole {
  Admin = "ADMIN",
  EXAMINER = "EXAMINER",
  MARKER = "MARKER",
  Student = "STUDENT"
}

export function isUserRole(role: any): role is UserRole {
  return Object.values(UserRole).includes(role);
}
