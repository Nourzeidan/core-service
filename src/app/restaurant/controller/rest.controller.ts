import type { NextFunction, Request, Response } from "express";
import { RestaurantService } from "../service/restaurant.service.js";
import { UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";
import { parseFilters, parsePaginationQuery } from "../../../lib/http/pagination/parse-query.js";
import { sendPaginated } from "../../../lib/http/response.js";

@injectable()
export class RestaurantController {
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService){}

    getAll = async(req:Request, res: Response, next:NextFunction) => {
        try{
             console.log('RAW URL:', req.url);
            console.log('PARSED QUERY:', JSON.stringify(req.query, null, 2));
            const params = parsePaginationQuery(req.query);
            const filters = parseFilters(req.query,['status', 'name']);
            console.log(filters)
            const result = await this.restaurantService.findAll(params, filters);
            sendPaginated(res, result.data, result.meta);
            // res.status(200).json({data: result});
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