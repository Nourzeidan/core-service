import { Router } from "express";
import { branchController } from "./controller/branch.controller.js";
import { authenticate } from "../../common/auth/guard.js";
export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearBy);
branchRouter.post('/restaurants/:restaurantId/branches', branchController.create);
branchRouter.get("/restaurants/:restaurantId/branches", branchController.findByRestaurant);
branchRouter.patch("/branches/:id",authenticate, branchController.update);
