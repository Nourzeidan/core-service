import { Router } from "express";
import { branchController } from "./controller/branch.controller.js";
import { authenticate } from "../../common/auth/guard.js";
import { rbac, requireRestaurantMember, requireBranchAccess } from "../auth/rbac.js";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearBy);
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
