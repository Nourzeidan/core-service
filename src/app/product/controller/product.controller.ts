import type { NextFunction , Request, Response} from "express";
import { validateBody } from "../../../common/validation/validate.js";
import { productService, ProductService } from "../service/product.service.js";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto.js";
import type { SystemRole } from "../../user/enums.js";
export class ProductController {
    constructor(private readonly productService: ProductService){}

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
}
export const productController = new ProductController(productService);