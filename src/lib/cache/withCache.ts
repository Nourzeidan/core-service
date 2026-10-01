import type { NextFunction, Request, Response } from "express";
import { TOKENS } from "../di/tokens.js";
import {container} from "../di/container.js";
import type { ICacheProvider } from "../../pkg/redis/cache.interface.js";

export function withCache(ttl=3600, userScoped = false) {
    return async(req: Request, res: Response, next: NextFunction) => {
        try{
            const cacheProvider: ICacheProvider = container.resolve(TOKENS.CacheProvider);

            let key = `${req.method}:${req.originalUrl}`;
            if(userScoped){
                key = `${key}:${req.user?.userId}`;
            }

            const cached = await cacheProvider.get(key);
            if(cached){
                res.setHeader("X-Cache","HIT");
                return res.status(200).json(JSON.parse(cached));
            }

            const originalJson = res.json.bind(res);

            res.json = ((body) => {
                if(res.statusCode >=200 && res.statusCode <=300){
                    cacheProvider.set(key, JSON.stringify(body), ttl);
                }
                res.setHeader("X-Cache", "MISS");
                return originalJson(body);
            });
            next();
        }catch(err){
            next(err);
        }
    }
}