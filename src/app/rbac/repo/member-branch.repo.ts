import { MemberBranch } from "../entity/member-branch.entity.js";
import type { Knex } from "knex";
import { db } from "../../../lib/knex/knex.js";

const MEMBER_BRANCH_COLUMNS = [
    "member_id",
    "branch_id",
    "created_at"
];

function toEntity(row: any): MemberBranch {
    return new MemberBranch({
        memberId: row.member_id,
        branchId: row.branch_id,
        createdAt: row.created_at
    });
}

export async function setMemberBranches(memberId: number, rows: MemberBranch[], conn: Knex=db): Promise<void> {
    const query = conn || db;
    await query("member_branches")
    .where('member_id', memberId)
    .delete();

    if(rows.length > 0){
        await query("member_branches")
        .insert(rows.map(row => ({
            member_id: row.memberId,
            branch_id: row.branchId,
            created_at: row.createdAt
        }))
    );
    }
}

export async function findBranchByMemberId(memberId: number): Promise<string[]> {
    const rows = await db("member_branches")
    .select("branch_id")
    .where("member_id", memberId);

    return rows.map(row=>row.branch_id);
}

export async function countBranchesByIdsAndRestaurant(branchIds: number[], restaurantId: number, conn: Knex=db ): Promise<number> {
    const row = await conn("restaurant_branches")
    .whereIn("id", branchIds).andWhere('restaurant_id', restaurantId)
    .count({ total: '*' })
    .first();

    return Number(row?.total ?? 0);
}