import type { NextFunction, Request, Response } from "express";
import { validateBody } from "../../../lib/validation/validate.js";
import { CreateMemberDTO, UpdateMemberBranchesDTO, UpdateMemberDTO } from "../dto/member.dto.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";
import type { MemberService } from "../service/member.service.js";

@injectable()
export class MemberController {
    constructor(@inject(TOKENS.MemberService) private readonly memberService: MemberService){}
    createMember =  async (req: Request, res: Response, next: NextFunction)=>{
        try{
            const data = await validateBody(CreateMemberDTO, req.body);
            const result = await this.memberService.createRestaurantMember(Number(req.params.restaurantId), data);
            res.status(201).send(result);
        }catch(err){
            next(err);
        }
    }

    listMembers = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const result = await this.memberService.listMembers(Number(req.params.restaurantId));
            res.status(200).send(result);
        }catch(err){
            next(err);
        }
    }

    updateMember = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(UpdateMemberDTO, req.body);
            const result = await this.memberService.updateMember
            (Number(req.params.restaurantId), Number(req.params.memberId), data);
            res.status(200).send(result);
        }catch(err){
            next(err);
        }
    }

    deleteMember = async(req: Request, res: Response, next: NextFunction) => {
        try{
            await this.memberService.deleteMember(Number(req.params.restaurantId), Number(req.params.memberId));
            res.status(204).send();
        }catch(err){
            next(err);
        }
    }

    updateMemberBranches = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(UpdateMemberBranchesDTO, req.body);
            const result = await this.memberService.updateMemberBranches(
                Number(req.params.restaurantId), Number(req.params.memberId), data
            );
            res.status(200).send(result);
        }catch(err){
            next(err);
        }
    }

    getRolePermissions = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const role = req.params.role;
            if (!role || Array.isArray(role)) {
                return res.status(400).json({ error: "role param required" });
            }
            const result = await this.memberService.getRolePermissions(role);
            res.status(200).send(result);
        }catch(err){
            next(err);
        }
    }

}