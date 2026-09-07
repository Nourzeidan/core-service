import http from "http";
import {createApp} from "./app.js";
import {env} from "./common/config/env.js";
import {db} from "./common/knex/knex.js";

const app = createApp();
const server = http.createServer(app);

server.listen(env.port, async () => {
    console.log(`Server is running on port ${env.port}`);
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
