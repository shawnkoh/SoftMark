// TODO: Temporarily deprecated
export interface Role {
  can: Action[];
  inherits?: string[];
}

export type Roles = { [key: string]: Role };

type Action = string | { name: string; when: (params: any) => boolean };

class RBAC {
  roles: Roles;

  constructor(roles: Roles) {
    this.roles = roles;
  }

  can(role: string, action: string, params: { [key: string]: any }): boolean {
    if (!this.roles[role]) {
      throw new Error("Role does not exist");
    }

    const $role = this.roles[role];
    // check if action exists in $role.can
    const $action = $role.can.find($action => {
      if (typeof $action === "string") {
        return action === $action;
      } else {
        return action === $action.name;
      }
    });

    if ($action) {
      if (typeof $action === "string") {
        return true;
      }
      return $action.when(params);
    }

    if (!$role.inherits || $role.inherits.length < 1) {
      return false;
    }

    // action not found, recursively check parents
    return $role.inherits.some(parentRole =>
      this.can(parentRole, action, params)
    );
  }
}