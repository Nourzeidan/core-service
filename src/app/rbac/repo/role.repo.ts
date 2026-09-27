import {Role} from "../entity/role.entity.js";
import type { Knex } from "knex";
import { db } from "../../../common/knex/knex.js";

const ROLE_COLUMNS = [
"id",
"name",
"display_name",
"description",
"created_at",
"updated_at"
];  

function toEntity(role: any): Role {
return new Role({
    id: role.id,
    name: role.name,
    displayName: role.display_name,
    description: role.description,
    createdAt: role.created_at,
    updatedAt: role.updated_at
});
}

export async function findRoleByName(name: string, conn:Knex=db): Promise<number | null> {
    const row = await conn("roles")
    .select('id')
    .where("name", name)
    .first();

    if(!row) return null;

    return row.id;
}