import { validateBody } from "../../../common/validation/validate.js";
import type { SystemRole } from "../../user/enums.js";
import { CreateBranchDTO, UpdateBranchDTO } from "../dto/branch.dto.js";
import { createBranch } from "../repository/branch.repo.js";
import { branchService, BranchService } from "../service/branch.service.js";
import type { NextFunction, Request, Response } from "express";
export class BranchController {
    constructor(private readonly branchService: BranchService ){}

    create = async(req: Request, res:Response,next: NextFunction) => {
        try{
            const data = await validateBody(CreateBranchDTO, req.body);
            const branch = await this.branchService.create( Number(req.params.restaurantId), req.user?.userId,
              req.user?.role as SystemRole, data);
            res.status(200).json({message: "branch added", branch});
        }catch(error){
            next(error);
        }
    }

    findNearBy = async(req: Request, res:Response,next: NextFunction) => {
        try{
            const results = await this.branchService.findNearBy(Number(req.query.lat), Number(req.query.long));
            res.status(200).json({data: results});
        }catch(error){
            next(error);
        }
    }

    findByRestaurant = async(req: Request, res:Response, next: NextFunction) => {
        try {
            const results = await this.branchService.findByRestaurant(Number(req.params.restaurantId));
            res.status(200).json({data: results});
        }catch(err){
            next(err);
        }
    }

    update = async(req: Request, res:Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchDTO, req.body);
            const results = await this.branchService.update(Number(req.user?.userId),Number(req.params.id), data);
            res.status(200).json(results);
        }catch(err){
            next(err);
        }
    }


}

export const branchController = new BranchController(branchService);