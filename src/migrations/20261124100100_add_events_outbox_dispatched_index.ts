import type { Knex } from "knex";

// supports the outbox cleanup (lib/events/outbox-cleanup.ts):
//   DELETE … WHERE dispatched_at < NOW() - <retention> (batched, oldest first)
// Partial: only published rows are in it (pending rows have their own idx_events_outbox_pending).
// Without it the daily cleanup scans the whole table, which is exactly the table that grows.
//
// CONCURRENTLY: building it must not block the worker's writes; Postgres refuses CONCURRENTLY inside
// a transaction, hence `transaction: false`.
export const config = { transaction: false };

export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_outbox_dispatched_at
            ON events_outbox (dispatched_at) WHERE dispatched_at IS NOT NULL;
    `);
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`DROP INDEX CONCURRENTLY IF EXISTS idx_events_outbox_dispatched_at;`);
}
