import {AuthService} from "../service/auth.service.js";
import type { NextFunction, Request, Response } from "express";
import { RegisterDTO, LoginDTO, ForgetPassDTO, ResetPasswordDTO } from "../dto/auth.dto.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { setAccessTokenCookie, setAuthCookies } from "../../../lib/utils/cookie.js";
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
                setAuthCookies(res, result.accessToken, result.refreshToken);
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

    // refresh token from the cookie (browsers) or the body (mobile apps that keep it themselves).
    // the new access token is set as a cookie AND returned, like login does
    refresh = async (req: Request, res: Response, next: NextFunction) => {
        try{
            const refreshToken = req.cookies?.refresh_token ?? req.body?.refreshToken;
            const result = await this.authService.refresh(refreshToken);
            setAccessTokenCookie(res, result.accessToken);
            sendSuccess(res, result);
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