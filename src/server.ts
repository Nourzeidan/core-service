import "reflect-metadata";
import http from "http";
import {createApp} from "./app.js";
import {env} from "./common/config/env.js";
import {db} from "./common/knex/knex.js";
import {logger} from "./common/logger/logger.js";

const app = createApp();
const server = http.createServer(app);

server.listen(env.port, ()=> {
    logger.info(`Server listening on ${env.port}`);
})

async function shutdown() {
    server.close(async () => {
        await db.destroy();
        console.log("Server closed.");
        process.exit(0);
    });
}

// ctrl c
process.on("SIGINT", shutdown);
// devops (kubernates/docker) 
process.on("SIGTERM", shutdown);

    // "migrate:make": "tsx ./node_modules/knex/bin/cli.js migrate:make",
