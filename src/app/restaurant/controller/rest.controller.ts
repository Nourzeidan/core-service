import type { NextFunction, Request, Response } from "express";
import { restaurantService, RestaurantService } from "../service/restaurant.service.js";

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
}
export const restaurantController = new RestaurantController(restaurantService);