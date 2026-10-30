import crypto from "crypto";
import type {NextFunction, Request, Response} from "express";
import {env} from "../config/env.js";
import {InternalApiNotConfiguredError, InvalidApiKeyError} from "./errors.js";

// Guards every /api/internal/* route (mounted once in src/routes.ts).
// Those routes are called by order-service, not by users, so there is no JWT:
// order-service proves who it is with the shared secret in the `api-key` header
// (its CORE_INTERNAL_API_KEY must equal our INTERNAL_API_KEY).
export function requireInternalApiKey(req: Request, res: Response, next: NextFunction) {
    // fail closed: no key configured -> nobody gets in (instead of "everybody gets in")
    if(!env.internal.apiKey){
        throw InternalApiNotConfiguredError;
    }

    const provided = req.headers["api-key"];
    if(typeof provided !== "string" || !safeEqual(provided, env.internal.apiKey)){
        throw InvalidApiKeyError;
    }
    next();
}

// constant-time compare: a normal === returns earlier the sooner the strings differ,
// which lets an attacker guess the key one character at a time by measuring response time
function safeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB);
}
