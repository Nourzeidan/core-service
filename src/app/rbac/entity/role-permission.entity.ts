export class RolePermission {
    roleId: number;
    permissionId: number;
    createdAt: Date;

    constructor(data: Partial<RolePermission>) {
        this.roleId = data.roleId!;
        this.permissionId = data.permissionId!;
        this.createdAt = data.createdAt ?? new Date();
    }
}

const ROLE_PERMISSION_COLUMNS = [
    "role_id",
    "permission_id",
    "created_at"
];

function toRolePermissionEntity(row: any): RolePermission {
    return new RolePermission({
        roleId: row.role_id,
        permissionId: row.permission_id,
        createdAt: row.created_at
    });
}