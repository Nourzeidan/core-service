import bcrypt from 'bcrypt';
import type { SignOptions } from 'jsonwebtoken';
import jwt from "jsonwebtoken";
import { env } from '../../common/config/env.js';
import crypto from "crypto";


export async function hashPassword(password: string): Promise<string> {
    // Implementation for hashing password
    return bcrypt.hash(password, 10);
}
export interface JwtPayload {
    userId: number;
    email: string;
    role: string; // mofeeda 3an enha teb2a query fel db
}
export function createAccessToken(payload: JwtPayload){
    // const payload = await jwt.verify(payload, process.env.ACCESS_TOKEN_SECRET as string);
    const options : SignOptions = {
        expiresIn: Number(env.jwt.accessExpiresIn)
    };
    return  jwt.sign(payload, env.jwt.accessSecret, options);
   
}

export function createRefreshToken(payload: JwtPayload){
    // const payload = await jwt.verify(payload, process.env.REFRESH_TOKEN_SECRET as string);
    const options : SignOptions = {
        expiresIn: Number(env.jwt.refreshExpiresIn)
    };
    return jwt.sign(payload, env.jwt.refreshSecret, options);
   
}

export function comparePassword(plainTextPassword: string, hashedPassword:string){
    return bcrypt.compare(plainTextPassword, hashedPassword);
    
}

export function generateOTP(){
    return crypto.randomInt(10000, 999999).toString();
}

export function hashOTP(otp: string){
    return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyAccessToken(token: string): JwtPayload{
    console.log('Secret used for verify:', env.jwt.accessSecret);
    return jwt.verify(token, env.jwt.accessSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload{
    return jwt.verify(token, env.jwt.refreshSecret) as JwtPayload;
}