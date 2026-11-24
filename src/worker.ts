import "reflect-metadata";
import {Cron} from "croner";
import {env} from "./lib/config/env.js";
import {logger} from "./lib/logger/logger.js";
import {db} from "./lib/knex/knex.js";
import {messageBroker} from "./lib/events/init.js";
import {drainOutbox} from "./lib/events/outbox-drain.js";
import {cleanupOutbox} from "./lib/events/outbox-cleanup.js";

// Outbox worker: a SEPARATE process from the http server (npm run worker:dev / npm run worker).
// The API only writes rows into events_outbox; this process publishes them to RabbitMQ.
// You can run several copies: claimPendingEvents uses SKIP LOCKED so they never publish the same row.

// protect: true -> if one drain is still running (e.g. waiting for the broker), the next tick is skipped
const job = new Cron(env.rabbit.drainCron, {protect: true}, async () => {
    try{
        await drainOutbox(messageBroker);
    }catch(err){
        logger.error("outbox drain error", {error: (err as Error).message});
    }
});
logger.info("worker: outbox drain scheduled", {pattern: env.rabbit.drainCron, batchSize: env.rabbit.batchSize});

// daily: delete events published more than OUTBOX_RETENTION_DAYS ago (pending ones are never touched)
const cleanupJob = new Cron(env.rabbit.cleanupCron, {protect: true}, async () => {
    try{
        await cleanupOutbox();
    }catch(err){
        logger.error("outbox cleanup error", {error: (err as Error).message});
    }
});
logger.info("worker: outbox cleanup scheduled", {pattern: env.rabbit.cleanupCron, retentionDays: env.rabbit.retentionDays});

// create the exchange up front so it exists even before the first event
messageBroker.declareExchange(env.rabbit.exchange)
    .then(() => logger.info("worker: broker connected, exchange declared", {exchange: env.rabbit.exchange}))
    .catch((err) => logger.warn("worker: could not declare exchange", {error: (err as Error).message}));

let shuttingDown = false;

async function shutdown() {
    if(shuttingDown) return;
    shuttingDown = true;
    logger.info("worker: shutdown requested");

    // force exit if something hangs (e.g. broker unreachable)
    setTimeout(() => process.exit(1), 10_000).unref();

    job.stop();
    cleanupJob.stop();
    await messageBroker.close();
    await db.destroy();
    process.exit(0);
}

// ctrl c
process.on("SIGINT", shutdown);
// devops (kubernetes/docker)
process.on("SIGTERM", shutdown);
