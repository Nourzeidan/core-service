import {Router} from "express";
import {authController} from "./controller/auth.controller.js";

const authRouter = Router();
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/forget-password", authController.forgetPassword);
authRouter.post("/reset-password", authController.resetPassword);

export {authRouter};