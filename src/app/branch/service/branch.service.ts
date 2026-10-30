import { SystemRole } from "../../user/enums.js";
import { createBranch, findNearbyBranches, findBranchesByRestaurant, updateBranch, findBranchById, updateBranchStatus } from "../repository/branch.repo.js";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo.js";
import { unAuthorizedError } from "../../../lib/auth/errors.js";
import type { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto.js";
import { db } from "../../../lib/knex/knex.js";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo.js";
import { EVENT_TYPES } from "../../../lib/events/event-types.js";
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
            deliveryFee: data.deliveryFee ?? 0,
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
        // update + outbox event in ONE transaction: either both are saved or neither
        // (order-service drops its cached copy of this branch when it receives branch.updated)
        const trx = await db.transaction();
        let updated: Branch | null;
        try {
            updated = await updateBranch({
                countryCode: data.countryCode,
                addressText: data.addressText,
                label: data.label,
                lat: data.lat,
                long: data.long,
                opensAt: data.opensAt,
                closesAt: data.closesAt,
                acceptOrders: data.acceptOrders,
                currency: data.currency,
                deliveryFee: data.deliveryFee,
                updatedAt: now,
            } as Branch, branchId, trx);

            if (!updated) {
                throw BranchNotFoundError;
            }

            await insertOutboxEvent({
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType: EVENT_TYPES.BRANCH_UPDATED,
                payload: {branchId}
            }, trx);
            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
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
                deliveryFee: updated.deliveryFee,
                updatedAt: updated.updatedAt
            }
        };
    };

    // system admin only. Turning a branch off emits branch.deactivated so order-service
    // stops accepting orders for it right away (instead of when its cache expires)
    updateStatus = async (userRole: SystemRole, branchId: number, data: UpdateBranchStatusDTO) => {
        if (userRole !== SystemRole.ADMIN) {
            throw unAuthorizedError;
        }
        await findBranchById(branchId); // throws BranchNotFoundError

        const trx = await db.transaction();
        try {
            const updated = await updateBranchStatus(data.isActive, branchId, trx);
            if (!updated) {
                throw BranchNotFoundError;
            }

            await insertOutboxEvent({
                aggregateType: "restaurant_branches",
                aggregateId: branchId,
                eventType: data.isActive ? EVENT_TYPES.BRANCH_UPDATED : EVENT_TYPES.BRANCH_DEACTIVATED,
                payload: {branchId}
            }, trx);
            await trx.commit();

            return {
                message: "Branch status updated",
                branch: {id: updated.id, isActive: updated.isActive, updatedAt: updated.updatedAt}
            };
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    // snapshot order-service needs at checkout (GET /api/internal/branches/:id).
    // pg returns BIGINT and DECIMAL columns as strings -> converted to numbers here
    findById = async (branchId: number) => {
        const branch = await findBranchById(branchId); // throws BranchNotFoundError (404)
        if (!branch) {
            throw BranchNotFoundError;
        }
        return {
            id: Number(branch.id),
            restaurantId: Number(branch.restaurantId),
            countryCode: branch.countryCode,
            currency: branch.currency,
            lat: Number(branch.lat),
            lng: Number(branch.long),
            isActive: branch.isActive,
            acceptOrders: branch.acceptOrders,
            deliveryFee: Number(branch.deliveryFee),
            commission: Number(branch.commission ?? 0),  // basis points: 1500 = 15%
            deliveryRadiusKm: Number(branch.deliveryRadius)
        };
    }

}