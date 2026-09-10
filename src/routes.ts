import {Router} from "express";
import {healthRouter} from "./app/health/health.routes.js";
import {authRouter} from "./app/auth/routes.js";
import { userRouter } from "./app/user/routes.js";

export const routes = Router();
routes.use(healthRouter);
routes.use("/auth", authRouter);
routes.use("/users", userRouter);