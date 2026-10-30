import {randomUUID} from "crypto";
import type {Knex} from "knex";
import type {EventType} from "./event-types.js";
import type {InsertOutboxInput, OutboxRow} from "./types.js";

// Transactional outbox, why?
// If a service did "UPDATE branch" and then "publish to RabbitMQ", a crash (or a broker outage)
// between the two would lose the event and order-service would keep a stale cache forever.
// Instead the service writes the event into events_outbox in the SAME transaction as the change:
// both are saved or neither is. src/worker.ts publishes the rows afterwards.
//
// `conn` has no default on purpose: passing the service's trx is mandatory, otherwise the
// event would be committed separately from the change and the guarantee is gone.
export async function insertOutboxEvent<T extends EventType>(input: InsertOutboxInput<T>, conn: Knex): Promise<void> {
    await conn("events_outbox").insert({
        aggregate_type: input.aggregateType,
        aggregate_id: String(input.aggregateId),
        event_type: input.eventType,
        event_id: randomUUID(),
        payload: JSON.stringify(input.payload),
        created_at: new Date()
    });
}

// worker side: lock the oldest pending rows.
// FOR UPDATE SKIP LOCKED -> rows locked by another worker are skipped instead of waited on,
// so several workers can run at once without publishing the same row twice.
export async function claimPendingEvents(limit: number, conn: Knex): Promise<OutboxRow[]> {
    const rows = await conn("events_outbox")
        .select("id", "aggregate_type", "aggregate_id", "event_type", "event_id", "payload", "attempts", "created_at")
        .whereNull("dispatched_at")
        .orderBy("id", "asc")
        .limit(limit)
        .forUpdate()
        .skipLocked();
    return rows as OutboxRow[];
}

export async function markEventDispatched(id: string, conn: Knex): Promise<void> {
    await conn("events_outbox").where({id}).update({dispatched_at: new Date()});
}

// the row stays pending (dispatched_at NULL) so the next drain retries it
export async function markEventFailed(id: string, error: string, conn: Knex): Promise<void> {
    await conn("events_outbox").where({id}).update({
        attempts: conn.raw("attempts + 1"),
        last_error: error.slice(0, 2000)
    });
}
