import type { NextFunction, Request, Response } from "express";
import { NotAuthenticated } from "../../common/auth/errors.js";
import { SystemRole } from "../user/enums.js";
import { permissionCacheService } from "../rbac/service/permission-cache.service.js";
export interface RBACOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean;
    checkOwnership?: boolean;
}

// check for permissions
// system admin bypass this
// rest users must have permissions for their role
export function rbac(options: RBACOptions) {
    return async(req: Request, res: Response, next: NextFunction)=> {

    try{
    // req.user is there 
    if(!req.user){
        throw NotAuthenticated;
    }
    // destructure
    const {resource, action,allowSystemAdmin = true} = options;
    // if system admin allow
    if(allowSystemAdmin && req.user.role == SystemRole.ADMIN){
        return next();
    }
    // restaurant user fetch permissions
    // check if perm have action for the resource
    if(req.user.role == SystemRole.RESTAURANT_USER){
        const permissions = await permissionCacheService.getPermissions(req.user.restaurantRole!);
        if(!permissionCacheService.hasPermissions(permissions, resource, action)) {
            return res.status(403).json({
                error: "Permission denied"
            })
        }
        return next();
    }
    return res.status(403).json({
        error: "Permission denied"
    })
    }catch(error) {
        next(error);
    }

}
}

export function requireRestaurantMember(paramName: string = 'restaurantId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        const restaurantId = parseInt(req.params[paramName] as string);
        if(!restaurantId){
            return res.status(500).json({"message": "something went wrong"});
        }

        if(req.user?.role == SystemRole.ADMIN) {
            return next();
        }

        if(Number(req.user?.restaurantId) !== Number(restaurantId)) {
            return res.status(403).json({
                error: "Permission denied",

            })
        }
        next();
    }
}

export function requireBranchAccess(paramName: string = 'branchId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        const branchId = parseInt(req.params[paramName] as string)|| parseInt(req.query[paramName] as string);
        if(!branchId){
            // some endpoints dont need branch check
            return next();
        }

        if(req.user?.role == SystemRole.ADMIN) {
            return next();
        }

        if(req.user?.restaurantRole == 'owner'){
            return next();
        }

        const userBranchIds = req.user?.branchIds || [];
        if (!userBranchIds.includes(branchId)) {
            return res.status(403).json({
                error: "You do not have access to this branch",
            })
        }
        next();
    }
}