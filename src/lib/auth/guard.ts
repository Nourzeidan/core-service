import type { NextFunction , Request, Response} from "express";
import { NotAuthenticated } from "./errors.js";
import { verifyAccessToken } from "../../app/auth/utils.js";

// token sources, in order (same rule as order-service, so one token works on both services):
//   1. Authorization: Bearer <jwt>   - mobile apps / postman
//   2. access_token cookie            - browsers (login sets it, httpOnly)
export function authenticate(req: Request, res: Response, next: NextFunction){
    const token = extractBearerToken(req.headers.authorization) ?? req.cookies?.access_token;
    if (!token) {
        throw NotAuthenticated;
    }

    req.user = verifyAccessToken(token);
    next()

}

function extractBearerToken(header: string | undefined): string | null {
    if (!header || !header.startsWith('Bearer ')) {
        return null;
    }
    const token = header.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
}
