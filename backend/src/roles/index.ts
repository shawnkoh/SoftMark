import { getRepository } from "typeorm";
import { PaperUser } from "../entities/PaperUser";

// TODO: Temporarily deprecated
export interface Role {
  can: Action[];
  inherits?: string[];
}

export type Roles = { [key: string]: Role };

type Action =
  | string
  | { name: string; when: (params: any) => Promise<boolean> };

class RBAC {
  roles: Roles;

  constructor(roles: Roles) {
    this.roles = roles;
  }

  async can(
    role: string,
    action: string,
    params: { [key: string]: any }
  ): Promise<boolean> {
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
      return typeof $action === "string" || $action.when(params);
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

const roles: Roles = {
  owner: {
    can: [
      {
        name: "crud:paperUser",
        when: async (params: any) => {
          const paperUser = await getRepository(PaperUser).findOne({
            where: { user: params.user.id }
          });
          return !!paperUser;
        }
      }
    ],
    inherits: ["examiner"]
  },
  examiner: {
    can: [
      {
        name: "crud:questionTemplate",
        when: async (params: any) => {
          const paperUser = await getRepository(PaperUser).findOne({
            where: { user: params.user.id }
          });
          return !!paperUser;
        }
      }
    ],
    inherits: ["marker"]
  },
  marker: {
    can: ["crud:mark"],
    inherits: ["student"]
  },
  student: {
    can: ["read:script"]
  }
};

export default new RBAC(roles);
