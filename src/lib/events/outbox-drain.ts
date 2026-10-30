import {db} from "../knex/knex.js";
import {env} from "../config/env.js";
import {logger} from "../logger/logger.js";
import type {IMessageBroker} from "../../pkg/messaging/message-broker.interface.js";
import {claimPendingEvents, markEventDispatched, markEventFailed} from "./outbox.repo.js";
import type {EventEnvelope} from "./types.js";

// One pass over the outbox (the worker calls this on every cron tick):
//   1. lock up to OUTBOX_BATCH_SIZE pending rows
//   2. publish each one and wait for the broker ACK
//   3. stamp dispatched_at only after the ACK
// If a publish fails, the row is marked failed and the pass stops: the broker is probably
// down, so there is no point trying the rest. They stay pending for the next tick.
//
// Delivery is "at least once": a crash after the ACK but before the commit republishes the
// row next time. That's fine because the event_id is the same and order-service dedupes on it.
export async function drainOutbox(broker: IMessageBroker): Promise<void> {
    // waits for the broker BEFORE opening the transaction, so no row locks are held while it is down
    await broker.connect();

    const trx = await db.transaction();
    try{
        const rows = await claimPendingEvents(env.rabbit.batchSize, trx);

        for(const row of rows){
            const envelope: EventEnvelope = {
                eventId: row.event_id,
                eventType: row.event_type,
                occurredAt: new Date(row.created_at).toISOString(),
                aggregateType: row.aggregate_type,
                aggregateId: row.aggregate_id,
                payload: row.payload
            };
            try{
                // routing key = event type (order-service binds "product.#" etc.)
                await broker.publish(env.rabbit.exchange, row.event_type, Buffer.from(JSON.stringify(envelope), "utf8"));
                await markEventDispatched(row.id, trx);
            }catch(err){
                const message = describeError(err);
                await markEventFailed(row.id, message, trx);
                logger.error("outbox publish failed", {id: row.id, eventType: row.event_type, error: message});
                break;
            }
        }

        await trx.commit();
    }catch(err){
        await trx.rollback();
        throw err;
    }
}

// amqp errors are sometimes AggregateErrors without a message -> dig the text out
function describeError(err: unknown): string {
    if(err instanceof Error && err.message){
        return err.message;
    }
    if(err && typeof err === "object" && "errors" in err && Array.isArray(err.errors) && err.errors.length > 0){
        return err.errors.map(describeError).join("; ");
    }
    return String(err);
}
