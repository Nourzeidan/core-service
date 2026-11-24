import {env} from "../config/env.js";
import {db} from "../knex/knex.js";
import {logger} from "../logger/logger.js";
import {deleteDispatchedEventsBefore} from "./outbox.repo.js";

const BATCH = 5000;

// events_outbox keeps every event forever otherwise: one row per branch / product / restaurant change.
// Once a row is PUBLISHED (dispatched_at set) order-service has it, so after OUTBOX_RETENTION_DAYS it
// is only debugging history. Pending rows (dispatched_at NULL) are never deleted, however old: they
// still have to reach RabbitMQ.
//
// Deletes in batches of 5000, each its own short statement, so the table is never locked for long
// and the drain keeps running in between. Scheduled by src/worker.ts (OUTBOX_CLEANUP_CRON).
export async function cleanupOutbox(retentionDays: number = env.rabbit.retentionDays): Promise<number> {
    const before = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let deleted = 0;
    let batch: number;
    do{
        batch = await deleteDispatchedEventsBefore(before, BATCH, db);
        deleted += batch;
    }while(batch === BATCH);
    logger.info("outbox cleanup done", {deleted, retentionDays, before: before.toISOString()});
    return deleted;
}
