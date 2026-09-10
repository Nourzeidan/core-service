import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE TABLE password_resets(
        id SERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        otp_hash TEXT NOT NULL,
        expired_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        consumed_at TIMESTAMP NOT NULL
        );
        CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
        `
    )
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP TABLE password_resets;`);
}

