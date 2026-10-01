import {AuthService} from "../service/auth.service.js";
import type { NextFunction, Request, Response } from "express";
import { RegisterDTO, LoginDTO, ForgetPassDTO, ResetPasswordDTO } from "../dto/auth.dto.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { env } from '../../../lib/config/env.js';
import { hoursToMS, daysToMs } from "../../../pkg/utils/time.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";
import { sendSuccess } from "../../../lib/http/response.js";

@injectable()
export class AuthController {
    constructor(@inject(TOKENS.AuthService) private readonly authService: AuthService) {
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1 validate req body
            // 2 call service
            // 3 return response
            const data = await validateBody(RegisterDTO, req.body);
            const result = await this.authService.register(data);
            sendSuccess(res, result, 201);
        } catch (error) {
            next(error); // 3shan te use el error handler middleware
        }
    } 
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
                // 1 validate req body
                // 2 call service
                // 3 return response
                const data = await validateBody(LoginDTO, req.body);
                const result = await this.authService.login(data);
                res.cookie("access_token", result.accessToken, {
                    httpOnly: true,
                    secure: env.app.nodeEnv === 'production',
                    maxAge: hoursToMS(1)
                });
                res.cookie("refresh_token", result.refreshToken, {
                    httpOnly: true,
                    secure: env.app.nodeEnv === 'production',
                    maxAge: daysToMs(7)
                    // path: '/api/auth/refresh'
                });
                sendSuccess(res, result, 201);
        } catch (error) {
                next(error); // 3shan te use el error handler middleware
            }
    }

    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ForgetPassDTO, req.body);
            await this.authService.forgetPassword(data);
            sendSuccess(res, {
                "message": "email sent"
            });
        }catch(error){
            next(error);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.resetPassword(data);
            sendSuccess(res, {
                "message": "password reset successful"
            });
        }catch(error){
            next(error);
        }
    }

    acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.acceptInvite(data);
            sendSuccess(res, {
                "message": "Invite accepted successful"
            });
        }catch(error){
            next(error);
        }
    }
}