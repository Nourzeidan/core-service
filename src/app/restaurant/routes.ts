import { Router } from "express";
import type { RestaurantController } from "./controller/rest.controller.js";
import { authenticate } from "../../lib/auth/guard.js";
import { rbac, requireRestaurantMember } from "../auth/rbac.js";
import { container} from "../../lib/di/container.js";
import { TOKENS } from "../../lib/di/tokens.js";
import { idempotency } from "../../lib/idempotency/idempotency.js";

export const restaurantRouter = Router();
const restaurantController = container.resolve<RestaurantController>(TOKENS.RestaurantController);
restaurantRouter.get('/', restaurantController.getAll);
// system admin only (checked in the service). optional Idempotency-Key against double submits
restaurantRouter.post('/', authenticate, idempotency(), restaurantController.create);
restaurantRouter.get('/:id', restaurantController.getById);

restaurantRouter.patch('/:id',authenticate,
     requireRestaurantMember('id'),
     rbac({resource:"core:restaurant", action:"update"}),
     restaurantController.updateRestaurant);

restaurantRouter.patch("/:id/status", authenticate, restaurantController.updateStatus);

// service-to-service, mounted under /api/internal (api-key checked once in src/routes.ts)
export const restaurantInternalRouter = Router();

restaurantInternalRouter.get('/restaurants/:id', restaurantController.getSummaryById);
