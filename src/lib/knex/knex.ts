import knex from "knex";
import config from "./knexfile.js";

export const db = knex(config);
// bt2aked en el database connected w el connection valid
export async function pingDB() {
    await db.raw("SELECT 1+1 AS result");
}