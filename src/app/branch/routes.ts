import { Router } from "express";
import { branchController } from "./controller/branch.controller.js";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearBy);
branchRouter.post('/restaurants/:restaurantId/branches', branchController.create);