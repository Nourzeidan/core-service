import {env} from "../config/env.js";
import type {Knex} from "knex";

const config: Knex.Config = {
    client: "pg",
    connection: {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.name,
    },
    // Each process (API, worker) keeps at most `max` connections; requests beyond that wait for a free
    // one instead of opening more. Size it so (API instances + workers) x max stays below Postgres'
    // max_connections (100 by default). min 0: idle connections are closed after idleTimeoutMillis,
    // so a quiet process doesn't hold connections it doesn't use (knex's own default min is 2).
    pool: {
        min: env.db.poolMin,
        max: env.db.poolMax,
        idleTimeoutMillis: env.db.poolIdleTimeoutMillis,
    },
    migrations: {
        directory: env.db.migrationDir,
        extension: env.db.migrationExtension
    }

};

export default config;