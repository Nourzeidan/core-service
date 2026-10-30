import {v4 as uuidv4} from "uuid";
import type {Request, Response, NextFunction} from "express";

// reuse the X-Correlation-ID order-service sends on internal calls, so one id shows up in the logs
// of both services for the same user request. Capped at 128 chars so nobody can stuff huge strings into our logs.
export function correlationId(req: Request, res: Response, next: NextFunction) {
    const incoming = req.headers["x-correlation-id"];
    req.correlationId = typeof incoming === "string" && incoming.length > 0 && incoming.length <= 128 ? incoming : uuidv4();
    res.setHeader("X-Correlation-ID", req.correlationId);
    next();
}
