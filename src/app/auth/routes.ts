import {Router} from "express";
import { TOKENS } from "../../lib/di/tokens.js";
import { container } from "../../lib/di/container.js";
import type { AuthController } from "./controller/auth.controller.js";
import { idempotency } from "../../lib/idempotency/idempotency.js";

const authRouter = Router();

const authController = container.resolve<AuthController>(TOKENS.AuthController);
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
// optional Idempotency-Key: a retried request with the same key does not send a second OTP email
authRouter.post("/forget-password", idempotency(), authController.forgetPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/accept-invite", authController.acceptInvite);
export {authRouter};
