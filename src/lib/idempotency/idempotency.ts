import type { NextFunction, Request, Response } from "express";
import type { ICacheProvider } from "../../pkg/redis/cache.interface.js";
import { container } from "../di/container.js";
import { TOKENS } from "../di/tokens.js";
import { AppError } from "../error/AppError.js";

// Idempotency = sending the same request twice has the same effect as sending it once.
// The client puts a random `Idempotency-Key: <uuid>` header on a POST; if it retries
// (timeout, flaky network, double click) with the SAME key, we replay the first response
// from Redis instead of running the handler again (no second email / second row).
//
// strict: true  -> the header is required, and Redis being down is a 503 (never risk a double write)
// strict: false -> no header = normal request; Redis down = run the handler anyway

const TTL_SECONDS = 24 * 60 * 60;
const MAX_KEY_LENGTH = 255;

const IdempotencyKeyRequiredError = new AppError('Missing Idempotency-Key header', 400);
const IdempotencyUnavailableError = new AppError('Idempotency service unavailable', 503);

interface IdempotencyOptions {
    strict?: boolean;
}

interface StoredResponse {
    statusCode: number;
    body: unknown;
}

export function idempotency(options: IdempotencyOptions = {}) {
    const { strict = false } = options;

    return async(req: Request, res: Response, next: NextFunction) => {
        if(!["POST", "PATCH", "PUT"].includes(req.method)){
            return next();
        }

        const idempotencyKey = req.headers["idempotency-key"];
        if(typeof idempotencyKey !== "string" || idempotencyKey.length === 0 || idempotencyKey.length > MAX_KEY_LENGTH){
            return strict ? next(IdempotencyKeyRequiredError) : next();
        }

        try{
            const cacheProvider = container.resolve<ICacheProvider>(TOKENS.CacheProvider);
            // path without the query string, so ?a=1 vs ?a=2 can't bypass it
            const key = `idempotency:${req.method}:${req.originalUrl.split("?")[0]}:${idempotencyKey}`;

            const cached = await cacheProvider.get(key);
            if(cached){
                const stored = JSON.parse(cached) as StoredResponse;
                res.setHeader("Idempotent-Replayed", "true");
                return res.status(stored.statusCode).json(stored.body);
            }

            // same trick as withCache: wrap res.json to save the response on its way out.
            // 5xx are not saved, so a retry after a server error really runs again
            const originalJson = res.json.bind(res);
            res.json = ((body: unknown) => {
                if(res.statusCode < 500){
                    const stored: StoredResponse = { statusCode: res.statusCode, body };
                    cacheProvider.set(key, JSON.stringify(stored), TTL_SECONDS).catch(() => {});
                }
                return originalJson(body);
            }) as Response["json"];

            next();
        }catch{
            return strict ? next(IdempotencyUnavailableError) : next();
        }
    }
}
