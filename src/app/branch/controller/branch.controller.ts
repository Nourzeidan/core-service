import { injectable, inject } from "tsyringe";
import { validateBody } from "../../../lib/validation/validate.js";
import type { SystemRole } from "../../user/enums.js";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto.js";
import { createBranch } from "../repository/branch.repo.js";
import {  BranchService } from "../service/branch.service.js";
import type { NextFunction, Request, Response } from "express";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class BranchController {
    constructor(@inject(TOKENS.BranchService) private readonly branchService: BranchService ){}

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

    updateStatus = async(req: Request, res:Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchStatusDTO, req.body);
            const results = await this.branchService.updateStatus(req.user?.role as SystemRole, Number(req.params.id), data);
            res.status(200).json(results);
        }catch(err){
            next(err);
        }
    }

    // internal (order-service): raw object, no {data: ...} wrapper - order-service reads the body as-is
    findById = async(req: Request, res:Response, next: NextFunction) => {
        try {
            const branch = await this.branchService.findById(Number(req.params.id));
            res.status(200).json(branch);
        }catch(err){
            next(err);
        }
    }


}