import type { Knex } from "knex";
import { RestaurantMember } from "../entity/restaurant-member.entity.js";
import { db } from "../../../lib/knex/knex.js";
import { MemberStatus } from "../enums.js";

const RESTAURANT_MEMBER_COLUMNS = [
    "id",
    "restaurant_id",
    "user_id",
    "role_id",
    "role_name",
    "status",
    "created_at",
    "updated_at"
];

function toEntity(row: any): RestaurantMember {
    return new RestaurantMember({
        id: row.id,
        restaurantId: row.restaurant_id,
        userId: row.user_id,
        roleId: row.role_id,
        status: row.status,
        roleName: row.role_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    });
}

export async function createRestaurantMember(data: Partial<RestaurantMember>, conn:Knex=db): Promise<RestaurantMember> {
    const query = conn || db;
    const [row] = await query("restaurant_members")
    .insert({
        restaurant_id: data.restaurantId,
        user_id: data.userId,
        role_id: data.roleId,
        status: data.status,
        role_name: data.roleName,
        created_at: data.createdAt,
        updated_at: data.updatedAt
    }).returning(RESTAURANT_MEMBER_COLUMNS);

    return toEntity(row);
}

export async function activateMemberByUserId(userId: number, conn:Knex=db ): Promise<void> {
    const query = conn || db;
    await query("restaurant_members").where("user_id", userId)
    .update({status: MemberStatus.ACTIVE,
            updated_at: new Date()
    });

}


export async function findRestaurantMemberWithRole(userId: number, conn: Knex = db):
 Promise<{ member: RestaurantMember; roleName: string }> {
    const row: any = await conn("restaurant_members as rm")
        .select(
            ...RESTAURANT_MEMBER_COLUMNS.map(col => `rm.${col}`),
            "r.name as roleName"
        )
        .leftJoin("roles as r", "rm.role_id", "r.id")
        .where("rm.user_id", userId)
        .andWhere("rm.status", "active")
        .first();

    return {
        member: toEntity(row),
        roleName: row.roleName
    };
}

export async function findMembersByRestaurantId(restaurantId: number, conn: Knex = db):
 Promise<Array<{ 
    id: number; 
    roleDisplayName: string;
    userId: number; 
    email: string; 
    name: string; 
    phone: string;
    role: string;
    status: MemberStatus }>> {
    const rows = await conn("restaurant_members as rm")
    .select(
        //  ...RESTAURANT_MEMBER_COLUMNS.map(col => `rm.${col}`),
            "rm.id as id",
            "u.id as userId",
            "u.email as email",
            "u.name as name",
            "u.phone as phone",
            "r.display_name as roleDisplayName",
            "rm.role_name as role",
            "rm.status as status"
    )
     .leftJoin("roles as r", "rm.role_id", "r.id")
     .leftJoin("users as u", "u.id", "rm.user_id")
     .where("rm.restaurant_id", restaurantId)

     return rows.map(row => ({
        id: row.id,
        roleDisplayName: row.roleDisplayName,
        userId: row.userId,
        email: row.email,
        name: row.name,
        phone: row.phone,
        role: row.role,
        status: row.status
    }));
}

export async function findMemberWithRoleName(memberId: number, conn: Knex=db): 
 Promise<{
    member: RestaurantMember;
    roleName: string
 } | null>{
     const row: any = await conn("restaurant_members as rm")
        .select(
            ...RESTAURANT_MEMBER_COLUMNS.map(col => `rm.${col}`),
            "r.name as roleName"
        )
        .leftJoin("roles as r", "rm.role_id", "r.id")
        .where("rm.id", memberId)
        // .andWhere("rm.status", "active")
        .first();

    if(!row) return null;
    return {
        member: toEntity(row),
        roleName: row.roleName
    };
}

export async function updateMember(
  memberId: number,
  data: { roleId?: number; status?: string },
  conn: Knex = db
): Promise<RestaurantMember | null> {
  const updateData: Record<string, any> = {
    updated_at: new Date()
  };

  if (data.roleId !== undefined) {
    updateData.role_id = data.roleId;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  const [row] = await conn("restaurant_members")
    .update(updateData)
    .where("id", memberId)
    .returning(RESTAURANT_MEMBER_COLUMNS);

  if (!row) return null;
  return toEntity(row);
}

export async function deleteMember(memberId: number, conn: Knex = db ): Promise<void> {
    await conn("restaurant_members")
    .where("id", memberId)
    .del();
}