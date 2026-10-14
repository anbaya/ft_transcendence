export interface RolePermission {
  module: string;
  actions: string[]; // e.g. ['Create', 'Read', 'Update', 'Delete']
}

export interface Role {
  id: string;
  name: string;
  description: string;
  users_count?: number;
  permissions: RolePermission[];
}

export interface UpdateRolePayload {
  description?: string;
  permissions?: RolePermission[];
}
