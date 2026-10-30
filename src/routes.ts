import {Router} from "express";
import {healthRouter} from "./app/health/health.routes.js";
import {authRouter} from "./app/auth/routes.js";
import { userRouter, userInternalRouter } from "./app/user/routes.js";
import { addressRouter, addressInternalRouter } from "./app/customer/routes.js";
import { restaurantRouter, restaurantInternalRouter } from "./app/restaurant/routes.js";
import { branchRouter, branchInternalRouter } from "./app/branch/routes.js";
import { productRouter, productInternalRouter } from "./app/product/routes.js";
import { memberRouter, memberInternalRouter } from "./app/rbac/routes.js";
import { requireInternalApiKey } from "./lib/auth/api-key.js";

export const routes = Router();
routes.use(healthRouter);

// /api/internal/* = called by order-service only (never by browsers).
// the api-key check sits here ONCE in front of every internal router, so a new internal
// route can't be exposed by forgetting the guard on it.
routes.use("/internal",
    requireInternalApiKey,
    branchInternalRouter,      // GET  /branches/:id
    restaurantInternalRouter,  // GET  /restaurants/:id
    addressInternalRouter,     // GET  /customers/:userId/addresses/:id
    productInternalRouter,     // POST /branches/:id/products/batch, /branches/:id/stock/reserve, /branches/:id/stock/release
    memberInternalRouter,      // GET  /roles/:roleName/permissions
    userInternalRouter         // GET  /users?ids=1,2,3
);

routes.use("/auth", authRouter);
routes.use("/users", userRouter);
routes.use("/customer", addressRouter);
routes.use("/restaurant", restaurantRouter);
routes.use("/", branchRouter);
routes.use("/", productRouter);
routes.use("/", memberRouter);
