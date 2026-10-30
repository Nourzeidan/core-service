import { Router } from "express";
import type { UserController } from "./controller/user.controller.js";
import { authenticate } from "../../lib/auth/guard.js";
import { container} from "../../lib/di/container.js";
import { TOKENS } from "../../lib/di/tokens.js";

export const userRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

userRouter.get('/me', authenticate, userController.getMe);
userRouter.patch('/me', authenticate, userController.updateUser);
// service-to-service, mounted under /api/internal (api-key checked once in src/routes.ts)
export const userInternalRouter = Router();

userInternalRouter.get('/users', userController.findContacts);
