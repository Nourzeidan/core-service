import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("restaurant_members", (table) => {
    table.dropUnique(["restaurant_id", "role_id"], "restaurant_members_restaurant_id_role_id_key");
    table.unique(["restaurant_id", "user_id"], "uq_restaurant_members_restaurant_user");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("restaurant_members", (table) => {
    table.dropUnique(["restaurant_id", "user_id"], "uq_restaurant_members_restaurant_user");
    table.unique(["restaurant_id", "role_id"], "restaurant_members_restaurant_id_role_id_key");
  });
}