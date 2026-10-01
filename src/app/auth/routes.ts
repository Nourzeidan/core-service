import {Router} from "express";
import { TOKENS } from "../../lib/di/tokens.js";
import { container } from "../../lib/di/container.js";
import type { AuthController } from "./controller/auth.controller.js";

const authRouter = Router();

const authController = container.resolve<AuthController>(TOKENS.AuthController);
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forget-password", authController.forgetPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/accept-invite", authController.acceptInvite);
export {authRouter};