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
    // pool: {
    //     max: env.db.poolMax || 10,
    //     min: env.db.poolMin || 2,
    //     idleTimeoutMillis: env.db.poolIdleTimeoutMillis || 30000,
    // },
    migrations: {
        directory: env.db.migrationDir,
        extension: env.db.migrationExtension
    }

};

export default config;