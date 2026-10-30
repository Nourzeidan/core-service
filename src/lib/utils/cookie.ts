import type { Response } from "express";
import { env } from "../config/env.js";
import { daysToMs, hoursToMS } from "../../pkg/utils/time.js";

// one place for the auth cookie options, used by login and refresh.
// httpOnly -> JavaScript in the browser can't read them (XSS can't steal the token)
// secure   -> https only in production
export function setAccessTokenCookie(res: Response, accessToken: string) {
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: env.isProduction,
        maxAge: hoursToMS(1)
    });
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    setAccessTokenCookie(res, accessToken);
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: env.isProduction,
        maxAge: daysToMs(7)
    });
}
