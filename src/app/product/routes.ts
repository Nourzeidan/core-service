import { Router } from "express";
import { authenticate } from "../../common/auth/guard.js";
import {productController} from "./controller/product.controller.js"
export const productRouter = Router();
productRouter.post('/restaurants/:restaurantId/products', authenticate, productController.create);
productRouter.get('/restaurants/:restaurantId/categories', productController.findCategories);
productRouter.get('/branches/:branchId/products', productController.findByBranch);
productRouter.get('/restaurants/:restaurantId/products', authenticate, productController.findByRestaurant);
productRouter.get('/products/:id', productController.findById);
productRouter.patch('/products/:id', authenticate, productController.update);