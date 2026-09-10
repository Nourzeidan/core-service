import type { NextFunction , Request, Response} from "express";
import { NotAuthenticated } from "./errors.js";
import { verifyAccessToken } from "../../app/auth/utils.js";
// import { JwtPayload } from '../../app/auth/utils.js';

export function authenticate(req: Request, res: Response, next: NextFunction){
    // const token = req.cookies.access_token;
    // if(!token){
    //     throw NotAuthenticated;
    // }
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw NotAuthenticated;
    }

    const token = authHeader.split(' ')[1]
    
    if (!token) {
        throw NotAuthenticated;
    }

    req.user = verifyAccessToken(token);
    next()

}