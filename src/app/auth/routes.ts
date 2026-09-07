import {Router} from "express";
import {authController} from "./controller/auth.controller.js";

const authRouter = Router();
authRouter.post("/register", authController.register);

export {authRouter};