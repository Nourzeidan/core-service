import { Router } from "express";
import { restaurantController } from "./controller/rest.controller.js";
import { authenticate } from "../../common/auth/guard.js";
export const restaurantRouter = Router();

restaurantRouter.get('/', restaurantController.getAll);
restaurantRouter.get('/:id', restaurantController.getById);
restaurantRouter.patch('/:id',authenticate, restaurantController.updateRestaurant);
restaurantRouter.patch("/:id/status", authenticate, restaurantController.updateStatus);