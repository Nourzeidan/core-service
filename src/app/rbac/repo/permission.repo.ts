import type { Knex } from "knex";
import { Permission } from "../entity/permission.entity.js";
import { db } from "../../../common/knex/knex.js";
// import { permission } from "node:process";
const PERMISSION_COLUMNS = [
    "id",
    "resource",
    "action",
    "created_at"
];

function toEntity(row: any): Permission {
    return new Permission({
        id: row.id,
        resource: row.resource,
        action: row.action,
        createdAt: row.created_at
    });
}

export async function getPermissionByRoleName(roleName: string, conn: Knex=db): Promise<string[]> {
    const rows = await conn("permissions as p")
    .select("p.id", "p.resource", "p.action","p.created_at")
    .join("role_permissions as rp", "p.id",  "rp.permission_id")
    .join("roles as r", "rp.role_id", "r.id")
    .where("r.name", roleName);

    return rows.map(row => {
        const entity = toEntity(row);
        return `${entity.resource}:${entity.action}`;
    });
}

export async function getPermissionsDetailsByRoleName(roleName: string, conn: Knex=db): Promise<{ permission: string }[]> {
    const rows = await conn("permissions as p")
    .select("p.id", "p.resource", "p.action","p.created_at")
    .join("role_permissions as rp", "p.id",  "rp.permission_id")
    .join("roles as r", "rp.role_id", "r.id")
    .where("r.name", roleName);

    return rows.map(row => {
        const entity = toEntity(row);
       return { permission: `${entity.resource}:${entity.action}` };
    });
}


