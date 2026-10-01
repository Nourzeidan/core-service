import { Router } from "express";
import { authenticate } from "../../lib/auth/guard.js";
import {ProductController} from "./controller/product.controller.js"
import { rbac, requireRestaurantMember, requireBranchAccess } from "../auth/rbac.js";
import { container} from "../../lib/di/container.js";
import { TOKENS } from "../../lib/di/tokens.js"

export const productRouter = Router();

const productController = container.resolve<ProductController>(TOKENS.ProductController);
productRouter.post('/restaurants/:restaurantId/products', 
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:product", action:"create"}),
    productController.create);

productRouter.get('/restaurants/:restaurantId/categories', productController.findCategories);
productRouter.get('/branches/:branchId/products', productController.findByBranch);

productRouter.get('/restaurants/:restaurantId/products',
     authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:product", action:"read"}),
    productController.findByRestaurant);
productRouter.get('/products/:id', productController.findById);
productRouter.patch('/products/:id', 
    authenticate,
    requireBranchAccess('branchId'),
    rbac({resource:"core:product", action:"update"}),
    productController.update);