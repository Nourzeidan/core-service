import type { Knex } from "knex";

// flat delivery fee per branch in MINOR units of the branch currency (piasters / halalas):
// 1500 = 15.00 EGP. Integers avoid float rounding errors in money math.
// order-service reads it at checkout through GET /api/internal/branches/:id
export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE restaurant_branches
        ADD COLUMN delivery_fee INT NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0);
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`ALTER TABLE restaurant_branches DROP COLUMN IF EXISTS delivery_fee;`);
}
