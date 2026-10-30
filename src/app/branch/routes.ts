import { Router } from "express";
import type { BranchController } from "./controller/branch.controller.js";
import { authenticate } from "../../lib/auth/guard.js";
import { rbac, requireRestaurantMember, requireBranchAccess } from "../auth/rbac.js";
import { container} from "../../lib/di/container.js";
import { TOKENS } from "../../lib/di/tokens.js";
import { withCache } from "../../lib/cache/withCache.js";

export const branchRouter = Router();

const branchController = container.resolve<BranchController>(TOKENS.BranchController);

branchRouter.get('/branches/nearby', withCache(),branchController.findNearBy);
branchRouter.post('/restaurants/:restaurantId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:branch", action:"create"}),
    branchController.create);

branchRouter.get("/restaurants/:restaurantId/branches", branchController.findByRestaurant);

branchRouter.patch("/branches/:id",
    authenticate,
    requireBranchAccess('id'),
    rbac({resource:"core:branch", action:"update"}),
    branchController.update);

// system admin only (checked in the service)
branchRouter.patch("/branches/:id/status", authenticate, branchController.updateStatus);

// service-to-service, mounted under /api/internal (api-key checked once in src/routes.ts)
export const branchInternalRouter = Router();

branchInternalRouter.get("/branches/:id", branchController.findById);
