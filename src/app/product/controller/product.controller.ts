import type { NextFunction , Request, Response} from "express";
import { validateBody } from "../../../lib/validation/validate.js";
import { ProductService } from "../service/product.service.js";
import { BranchProductsBatchDTO, CreateProductDTO, ReleaseStockDTO, ReserveStockDTO, UpdateProductDTO } from "../dto/product.dto.js";
import type { SystemRole } from "../../user/enums.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class ProductController {
    constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService){}

    create =  async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data =  await validateBody(CreateProductDTO, req.body);
            const product = await this.productService.create(Number(req.user?.userId), Number(req.params.restaurantId),
                      req.user?.role as SystemRole, data);
            res.status(200).json(product);
        }catch(err){
            next(err);
        } 
    }

    findCategories = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const result = await this.productService.findCategories(Number(req.params.restaurantId));
            res.status(200).json({data:result});
        }catch(err){
            next(err);
        }
    }

    findByBranch = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const result = await this.productService.findByBranch(Number(req.params.branchId));
            res.status(200).json({data:result});
        }catch(err){
            next(err);
        }
    }

    findByRestaurant = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const result = await this.productService.findByRestaurant(Number(req.user?.userId), Number(req.params.restaurantId), req.user?.role as SystemRole);
            res.status(200).json({data:result});
        }catch(err){
            next(err);
        }
    }

    findById = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const result = await this.productService.findById(Number(req.params.id));
            res.status(200).json({data:result});
        }catch(err){
            next(err);
        }
    }

    update = async(req: Request, res: Response, next: NextFunction) => {
        try{
             const data =  await validateBody(UpdateProductDTO, req.body);
             const product = await this.productService.update(Number(req.user?.userId), Number(req.params.id), 
             req.query.branchId ? Number(req.query.branchId): null, data);
            res.status(200).json(product);
        }catch(error){
            next(error);
        }
    }

    // ---- internal (order-service): raw bodies, no {data: ...} wrapper ----

    findBranchProducts = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(BranchProductsBatchDTO, req.body);
            const result = await this.productService.findBranchProducts(Number(req.params.id), data.productIds);
            res.status(200).json(result);
        }catch(err){
            next(err);
        }
    }

    // 204 = done, no body (the contract order-service expects)
    reserveStock = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ReserveStockDTO, req.body);
            await this.productService.reserveStock(Number(req.params.id), data);
            res.status(204).send();
        }catch(err){
            next(err);
        }
    }

    releaseStock = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ReleaseStockDTO, req.body);
            await this.productService.releaseStock(Number(req.params.id), data);
            res.status(204).send();
        }catch(err){
            next(err);
        }
    }
}
