import { Router } from "express";
import { userController } from "./controller/user.controller.js";
import { authenticate } from "../../common/auth/guard.js";

export const userRouter = Router();

userRouter.get('/me', authenticate, userController.getMe);