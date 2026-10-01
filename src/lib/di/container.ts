import { container } from "tsyringe";
import { TOKENS } from "./tokens.js";

import { UserController } from "../../app/user/controller/user.controller.js";
import { AuthController } from "../../app/auth/controller/auth.controller.js";
import { RestaurantController } from "../../app/restaurant/controller/rest.controller.js"; 
import { BranchController } from "../../app/branch/controller/branch.controller.js";
import { MemberController } from "../../app/rbac/controller/member.controller.js"; 
import { ProductController } from "../../app/product/controller/product.controller.js"; 
import { AddressController } from "../../app/customer/addresses/controller/address.controller.js"; 

// Services 
import { AuthService } from "../../app/auth/service/auth.service.js";
import { UserService } from "../../app/user/service/user.service.js";
import { RestaurantService } from "../../app/restaurant/service/restaurant.service.js";
import { BranchService } from "../../app/branch/service/branch.service.js"; 
import { MemberService } from "../../app/rbac/service/member.service.js"; 
import { ProductService } from "../../app/product/service/product.service.js";
import { AddressService } from "../../app/customer/addresses/service/address.service.js"; 
import { PermissionCacheService } from "../../app/rbac/service/permission-cache.service.js"; 
// Lib / Info
import { Logger } from "../logger/logger.js"; 
import { cacheProvider } from "../cache/init.js";

container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<AuthService>(TOKENS.AuthService, AuthService);
container.registerSingleton<RestaurantService>(TOKENS.RestaurantService, RestaurantService);
container.registerSingleton<BranchService>(TOKENS.BranchService, BranchService);
container.registerSingleton<MemberService>(TOKENS.MemberService, MemberService);
container.registerSingleton<ProductService>(TOKENS.ProductService, ProductService);
container.registerSingleton<AddressService>(TOKENS.AddressService, AddressService);
container.registerSingleton<PermissionCacheService>(TOKENS.PermissionCacheService, PermissionCacheService);

// Register Controllers
container.registerSingleton<AuthController>(TOKENS.AuthController, AuthController);
container.registerSingleton<UserController>(TOKENS.UserController, UserController);
container.registerSingleton<RestaurantController>(TOKENS.RestaurantController, RestaurantController);
container.registerSingleton<BranchController>(TOKENS.BranchController, BranchController);
container.registerSingleton<MemberController>(TOKENS.MemberController, MemberController);
container.registerSingleton<ProductController>(TOKENS.ProductController, ProductController);
container.registerSingleton<AddressController>(TOKENS.AddressController, AddressController);

// Register Lib / Logger
container.registerSingleton<Logger>(TOKENS.Logger, Logger);
container.registerInstance(TOKENS.CacheProvider, cacheProvider);
export {container};