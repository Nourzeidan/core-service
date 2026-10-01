import { SystemRole } from "../../user/enums.js";
import { createBranch, findNearbyBranches, findBranchesByRestaurant, updateBranch, findBranchById } from "../repository/branch.repo.js";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo.js";
import { unAuthorizedError } from "../../../lib/auth/errors.js";
import type { CreateBranchDTO, UpdateBranchDTO } from "../dto/branch.dto.js";
import { RestaurantNotFoundError } from "../../restaurant/errors.js";
import { UserNotFoundError } from "../../user/errors.js";
import { BranchNotFoundError } from "../errors.js";
import { findUserById } from "../../user/repository/users.repo.js";
import { Branch } from "../entity/branch.entity.js";
import { injectable } from "tsyringe";

@injectable()
export class BranchService {
    findNearBy = async (lat: number, lng:number) => {
        const rows = await findNearbyBranches(lat, lng);
        return rows;
    }

    create = async (restaurantId:number, userId:number, userRole: SystemRole, data: CreateBranchDTO)=>{
        const restaurant = await findRestaurantById(restaurantId);
        if(!restaurant){
            throw RestaurantNotFoundError;
        }
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

    findByRestaurant = async (restaurantId:number)=> {
        const restauant = await findRestaurantById(restaurantId);
        if(!restauant){
            throw RestaurantNotFoundError;
        }

        const branches = await findBranchesByRestaurant(restaurantId)
        return branches;
    }

    update = async (userId: number, branchId: number, data: UpdateBranchDTO) => {

        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }

        const restaurant = await findRestaurantById(branch.restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        const user = await findUserById(userId);
        if (!user) {
            throw UserNotFoundError;
        }

        const isOwner = restaurant.ownerId === userId;
        const isAdmin = user.systemRole === SystemRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw unAuthorizedError;
        }

        const now = new Date();
        const updated = await updateBranch({
            countryCode: data.countryCode,
            addressText: data.addressText,
            label: data.label,
            lat: data.lat,
            long: data.long,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            acceptOrders: data.acceptOrders,
            currency: data.currency,
            updatedAt: now,
        } as Branch, branchId);

        if (!updated) {
            throw BranchNotFoundError;
        }

        return {
            message: "Branch updated",
            branch: {
                id: updated.id,
                restaurantId: updated.restaurantId,
                label: updated.label,
                countryCode: updated.countryCode,
                addressText: updated.addressText,
                lat: updated.lat,
                long: updated.long,
                isActive: updated.isActive,
                opensAt: updated.opensAt,
                closesAt: updated.closesAt,
                acceptOrders: updated.acceptOrders,
                currency: updated.currency,
                commission: updated.commission,
                updatedAt: updated.updatedAt
            }
        };
    };
    
}