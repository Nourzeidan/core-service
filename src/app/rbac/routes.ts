import { Router } from "express";
import { authenticate } from "../../common/auth/guard.js";
import { memberController } from "./controller/member.controller.js";
import { rbac, requireRestaurantMember } from "../auth/rbac.js";
export const memberRouter = Router();

memberRouter.post('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:member", action:'create'}),
    memberController.createMember);

memberRouter.get('/roles/:role/permissions',
    memberController.getRolePermissions);

memberRouter.get('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:member", action: 'read'}),
    memberController.listMembers);

memberRouter.patch('/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:member", action: 'update'}),
    memberController.updateMember);

memberRouter.delete('/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:member", action: 'delete'}),
    memberController.deleteMember);

memberRouter.put('/restaurants/:restaurantId/members/:memberId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:member", action: 'update'}),
    memberController.updateMemberBranches);

