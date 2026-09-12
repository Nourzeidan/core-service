import { Router } from "express";
import { restaurantController } from "./controller/rest.controller.js";

export const restaurantRouter = Router();

restaurantRouter.get('/',restaurantController.getAll);