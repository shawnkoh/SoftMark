export enum UserRole {
  Admin = "ADMIN",
  User = "USER"
}

export function isUserRole(role: any): role is UserRole {
  return Object.values(UserRole).includes(role);
}
