import type { Knex } from "knex";

// SystemRole already has DELIVERY_AGENT and RegisterDTO accepts it, but the users table CHECK
// only allowed admin / restaurant_user / customer, so registering an agent crashed with a 500.
// order-service needs agent users (assignments, GET /api/internal/users).
// users_system_role_check = the name postgres gave the inline CHECK of create_users_table
export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_system_role_check;
        ALTER TABLE users ADD CONSTRAINT users_system_role_check
            CHECK (system_role IN ('admin', 'restaurant_user', 'customer', 'delivery_agent'));
    `);
}

// fails if delivery agents exist already (on purpose: delete them first)
export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_system_role_check;
        ALTER TABLE users ADD CONSTRAINT users_system_role_check
            CHECK (system_role IN ('admin', 'restaurant_user', 'customer'));
    `);
}
