import type { Knex } from "knex";

// A logo is optional everywhere in the API (RegisterRestaurantDTO, UpdateRestaurantDTO and the admin
// DTO all have `logoURL?`), but the column was NOT NULL, so self-registering a restaurant without a
// logo crashed with a 500 and the admin endpoint had to send "" as a placeholder.
// The column now follows the API: NULL = no logo. Existing "" placeholders become NULL.
export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        ALTER TABLE restaurants ALTER COLUMN logo_url DROP NOT NULL;
        UPDATE restaurants SET logo_url = NULL WHERE logo_url = '';
    `);
}

// back to NOT NULL: restaurants without a logo get the old "" placeholder again
export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        UPDATE restaurants SET logo_url = '' WHERE logo_url IS NULL;
        ALTER TABLE restaurants ALTER COLUMN logo_url SET NOT NULL;
    `);
}
