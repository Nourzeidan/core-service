import {Router} from "express";
import {pingDB} from "../../common/knex/knex.js";

export const healthRouter = Router();

healthRouter.get("/health", async (req, res) => {
    try {
        await pingDB();
        res.status(200).json({status: "ok"});
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(500).json({status: "error", message: "Database connection failed"});
    }
});