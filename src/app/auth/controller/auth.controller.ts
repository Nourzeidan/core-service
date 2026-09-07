import {AuthService, authService} from "../service/auth.service.js";
import type { NextFunction, Request, Response } from "express";
import { RegisterDTO } from "../dto/auth.dto.js";
import { validateBody } from "../../../common/validation/validate.js";
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1 validate req body
            // 2 call service
            // 3 return response
            const data = await validateBody(RegisterDTO, req.body);
            const result = await this.authService.register(data);
            res.status(201).json(result);
        } catch (error) {
            next(error); // 3shan te use el error handler middleware
        }
}
}

export const authController = new AuthController(authService);