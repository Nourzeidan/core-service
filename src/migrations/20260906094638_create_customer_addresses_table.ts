import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE customer_addresses(
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        lat DECIMAL(10,7) NOT NULL,
        lng DECIMAL(10,7) NOT NULL,
        country TEXT NOT NULL,
        building TEXT,
        city TEXT NOT NULL,
        street TEXT NOT NULL,
        apartment TEXT,
        type TEXT NOT NULL CHECK (type IN ('home', 'work', 'other')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_default BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE INDEX idx_customer_addresses_user_id ON customer_addresses(user_id);
    `)

}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE customer_addresses;`);
}

