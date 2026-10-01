import { Router } from "express";
import type { RestaurantController } from "./controller/rest.controller.js";
import { authenticate } from "../../lib/auth/guard.js";
import { rbac, requireRestaurantMember } from "../auth/rbac.js";
import { container} from "../../lib/di/container.js";
import { TOKENS } from "../../lib/di/tokens.js";

export const restaurantRouter = Router();
const restaurantController = container.resolve<RestaurantController>(TOKENS.RestaurantController);
restaurantRouter.get('/', restaurantController.getAll);
restaurantRouter.get('/:id', restaurantController.getById);

restaurantRouter.patch('/:id',authenticate,
     requireRestaurantMember('id'), 
     rbac({resource:"core:restaurant", action:"update"}), 
     restaurantController.updateRestaurant);

restaurantRouter.patch("/:id/status", authenticate, restaurantController.updateStatus);