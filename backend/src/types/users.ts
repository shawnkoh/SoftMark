export enum UserRole {
  Admin = "ADMIN",
  Customer = "Customer"
}

export function isUserRole(role: any): role is UserRole {
  return Object.values(UserRole).includes(role);
}
