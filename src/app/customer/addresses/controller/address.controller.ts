import type { NextFunction, Request, Response } from "express";
import { validateBody } from "../../../../lib/validation/validate.js";
import { CreateAddressDTO, UpdateAddressDTO} from "../dto/address.dto.js";
import { env } from '../../../../lib/config/env.js';
import { AddressService } from "../service/address.service.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../../lib/di/tokens.js";

@injectable()
export class AddressController {
     constructor(@inject(TOKENS.AddressService) private readonly addressService: AddressService) {
        }
    
    createAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1 validate req body
            // 2 call service
            // 3 return response
            // const userId = req.user!.id;
            const userId = req.user!.userId;
            const data = await validateBody(CreateAddressDTO, req.body);
            const result = await this.addressService.createAddress(userId, data);
            res.status(201).json(result);
        } catch (error) {
            next(error); // 3shan te use el error handler middleware
        }
    } 

    updateAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;          // From authenticated user session/token
            const addressId = Number(req.params.id); // From the URL path (/api/addresses/:id)
            
            const data = await validateBody(UpdateAddressDTO, req.body);
            const result = await this.addressService.updateAddressService(userId, data, addressId);
            
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
        try{
                const addressId = Number(req.params.id);
                const result = await this.addressService.deleteAddressRec(addressId);

                res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }

    // internal (order-service): raw object, no {data: ...} wrapper
    findOwnedAddress = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.addressService.findOwnedAddress(Number(req.params.userId), Number(req.params.id));
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    findAllAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.userId;
        const result = await this.addressService.findAddresses(userId);
        res.status(200).json({ data: result });
    } catch (error) {
        next(error);
    }
}
}