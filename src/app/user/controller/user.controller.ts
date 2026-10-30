import { UserService } from "../service/user.service.js";
import type { NextFunction, Request, Response } from "express";
import { validateBody } from "../../../lib/validation/validate.js";
import { UpdateUserrDTO } from "../dto/user.dto.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class UserController {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService) {}

    getMe = async  (req: Request, res: Response, next: NextFunction) => {
        try{
            // might be an error
            const user = await this.userService.getByUserId(req.user?.userId!);
            return res.status(200).json(user);
        }catch(err){
            next(err);
        }
    }

    updateUser = async (req:Request, res: Response, next: NextFunction) => {
        try{
                const data = await validateBody(UpdateUserrDTO, req.body);
                const result = await this.userService.updateUser(data, req.user?.userId!);
                res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }

    // internal (order-service): GET /internal/users?ids=1,2,3 -> [{id, name, phone}]
    findContacts = async (req:Request, res: Response, next: NextFunction) => {
        try{
            const ids = String(req.query.ids ?? "").split(",").filter(id => id.trim().length > 0).map(Number);
            const result = await this.userService.findContactsByIds(ids);
            res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }
}