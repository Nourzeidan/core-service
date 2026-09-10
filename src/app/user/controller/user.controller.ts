import type { User } from "../entity/user.entity.js";
import { UserService, userService } from "../service/user.service.js";
import type { NextFunction, Request, Response } from "express";

export class UserController {
    constructor(private readonly userService: UserService) {}

    getMe = async  (req: Request, res: Response, next: NextFunction) => {
        try{
            // might be an error
            const user = await this.userService.getByUserId(req.user?.userId!);
            return res.status(200).json(user);
        }catch(err){
            next(err);
        }
    }
}

export const userController = new UserController(userService);