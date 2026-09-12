import { SystemRole } from "../../user/enums.js";
import { createBranch, findNearbyBranches } from "../repository/branch.repo.js";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo.js";
import { unAuthorizedError } from "../../../common/auth/errors.js";
import type { CreateBranchDTO } from "../dto/branch.dto.js";
export class BranchService {
    findNearBy = async (lat: number, lng:number) => {
        const rows = await findNearbyBranches(lat, lng);
        return rows;
    }

    create = async (restaurantId:number, userId:number, userRole: SystemRole, data: CreateBranchDTO)=>{
        const restaurant = await findRestaurantById(restaurantId);
        // if the logged user is not sys admin and not the owner of the rest
        if(userRole != SystemRole.ADMIN && restaurant.ownerId != userId) {
            throw unAuthorizedError;
        }
        
        const now = new Date();
        const branch = await createBranch({
            restaurantId: restaurantId,
            countryCode: data.countryCode,
            label: data.label,
            addressText: data.addressText,
            lat: data.lat,
            long: data.long,
            isActive: data.isActive ?? true,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            acceptOrders: data.acceptOrders ?? true,
            deliveryRadius: data.deliveryRadius,
            currency: data.currency,
            commission: 0,
            createdAt: now,
            updatedAt: now
        });
        return branch;
    }
    
}

export const branchService = new BranchService();