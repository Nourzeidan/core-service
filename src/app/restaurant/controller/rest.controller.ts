import type { NextFunction, Request, Response } from "express";
import { RestaurantService } from "../service/restaurant.service.js";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto.js";
import type { SystemRole } from "../../user/enums.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";
import { parseFilters, parsePaginationQuery } from "../../../lib/http/pagination/parse-query.js";
import { sendPaginated } from "../../../lib/http/response.js";
import { parseIdList } from "../../../lib/http/parse-ids.js";
import { InvalidRestaurantIdsError } from "../errors.js";

@injectable()
export class RestaurantController {
    constructor(@inject(TOKENS.RestaurantService) private readonly restaurantService: RestaurantService){}

    getAll = async(req:Request, res: Response, next:NextFunction) => {
        try{
            const params = parsePaginationQuery(req.query);
            const filters = parseFilters(req.query,['status', 'name']);
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

    create = async (req:Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(CreateRestaurantDTO, req.body);
            const result = await this.restaurantService.createWithOwner(req.user?.role as SystemRole, data);
            res.status(201).json(result);
        }catch(error){
            next(error);
        }
    }

    // internal (order-service): raw object, no {data: ...} wrapper
    // internal: GET /internal/restaurants?ids=1,2,3 -> [summary, ...] (one query)
    getSummariesByIds = async(req:Request, res: Response, next:NextFunction) => {
        try{
            const ids = parseIdList(req.query.ids);
            if(!ids){
                throw InvalidRestaurantIdsError;
            }
            res.status(200).json(await this.restaurantService.findSummariesByIds(ids));
        }catch(err){
            next(err);
        }
    }

    getSummaryById = async(req:Request, res: Response, next:NextFunction) => {
        try{
            const result = await this.restaurantService.findSummaryById(Number(req.params.id));
            res.status(200).json(result);
        }catch(err){
            next(err);
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