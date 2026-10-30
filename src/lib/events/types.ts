import type {EventPayloads, EventType} from "./event-types.js";

// one row of the events_outbox table (snake_case = straight from the db)
export interface OutboxRow {
    id: string;                 // BIGSERIAL comes back from pg as a string
    aggregate_type: string;
    aggregate_id: string;
    event_type: EventType;
    event_id: string;           // uuid sent to consumers as eventId (stable across retries -> they dedupe on it)
    payload: unknown;           // JSONB -> already parsed by pg
    attempts: number;
    created_at: Date;
}

export interface InsertOutboxInput<T extends EventType> {
    aggregateType: string;      // table the change happened on, e.g. "restaurant_branches"
    aggregateId: string | number;
    eventType: T;
    payload: EventPayloads[T];
}

// what actually goes over the wire (order-service CoreEventEnvelope)
export interface EventEnvelope {
    eventId: string;
    eventType: EventType;
    occurredAt: string;
    aggregateType: string;
    aggregateId: string;
    payload: unknown;
}
