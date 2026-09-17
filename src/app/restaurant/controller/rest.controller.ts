import type { NextFunction, Request, Response } from "express";
import { restaurantService, RestaurantService } from "../service/restaurant.service.js";
import { UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto.js";
import { validateBody } from "../../../common/validation/validate.js";

export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService){}

    getAll = async(req:Request, res: Response, next:NextFunction) => {
        try{
            const result = await this.restaurantService.findAll();
            res.status(200).json({data: result});
        }catch(error){
            next(error);
        }
    }

    getById = async(req:Request, res: Response, next:NextFunction) => {
        try{
            const result = await this.restaurantService.findById( Number(req.params.id));
            res.status(200).json({data: result});
        }catch(err){
            next(err);
        }
    }

    updateRestaurant = async (req:Request, res: Response, next: NextFunction) => {
        try{
                const data = await validateBody(UpdateRestaurantDTO, req.body);
                const result = await this.restaurantService.update(req.user?.userId!, Number(req.params.id), data);
                res.status(200).json(result);
        }catch(error){
            next(error);
        }
    }

    updateStatus = async (req:Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(UpdateRestaurantStatusDTO, req.body);
            const result = await this.restaurantService.updateStatus(req.user?.userId!, Number(req.params.id), data);
            res.status(200).json(result);

        }catch(err){
            next(err);
        }
    }
}
export const restaurantController = new RestaurantController(restaurantService);