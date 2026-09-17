import type { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto.js";
import { Restaurant } from "../entity/restaurant.entity.js";
import { RestaurantStatus } from "../enums.js";
import { createRestaurant, findAllRestaurants, findRestaurantById, updateRestaurant, updateRestaurantStatus } from "../repository/restaurant.repo.js";
import { NotAuthorizedError, RestaurantNotFoundError } from "../errors.js";
import type { UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto.js";
import { findUserById } from "../../user/repository/users.repo.js";
import { UserNotFoundError } from "../../user/errors.js";
import { SystemRole } from "../../user/enums.js";
import { db } from "../../../common/knex/knex.js";
export class RestaurantService {
    create = async (userId: number, data: RegisterRestaurantDTO, trx: Knex)=>{
        const now = new Date();
        const restaurant = new Restaurant({
            ownerId: userId,
            name: data.name,
            logoURL: data.logoURL,
            primaryCountry: data.primaryCountry,
            status: RestaurantStatus.PENDING,
            createdAt: now,
            updatedAt:  now,
            statusUpdatedAt: now
        } as Restaurant);

        const result = await createRestaurant(restaurant, trx);
        return result;
    }

    findAll = async() => {
        const result = await findAllRestaurants();
        return result;
    }

    findById = async(id: number) => {
        const result = await findRestaurantById(id);
        if(!result){
            throw RestaurantNotFoundError;
        }
        return result;
    }

    update = async(userId: number, restaurantId: number, data: UpdateRestaurantDTO) => {
        const user = await findUserById(userId);
        if(!user){
            throw UserNotFoundError;
        }
        if(user.systemRole == SystemRole.CUSTOMER || user.systemRole == SystemRole.DELIVERY_AGENT){ // fragile because what if i want to add a new role?
            throw NotAuthorizedError;
        }
        const now = new Date();
        const updated =  await updateRestaurant({
            ownerId: userId,
            name: data.name,
            logoURL: data.logoURL,
            primaryCountry: data.primaryCountry,
            updatedAt:  now,
        } as Restaurant, restaurantId);

        return {
            message: "Restaurant updated",
            restaurant: {
                id: updated!.id,
                name: updated!.name,
                logoURL: updated!.logoURL,
                primaryCountry: updated!.primaryCountry,
                updatedAt: updated!.updatedAt
            }
        }
    }

    updateStatus = async(userId: number, restaurantId: number, data: UpdateRestaurantStatusDTO) => {
        const user = await findUserById(userId);
        if(!user){
            throw UserNotFoundError;}
        const exists = await findRestaurantById(restaurantId);
        if(!exists){
            throw RestaurantNotFoundError;
        }
        if(user.systemRole != SystemRole.ADMIN){ // fragile because what if i want to add a new role?
            throw NotAuthorizedError;
        }

        const now = new Date();
        const updated = await updateRestaurantStatus({
            status: data.status,
            statusUpdatedAt: now
        }, restaurantId);

         return {
            message: "Restaurant updated",
            restaurant: {
                id: updated!.id,
                name: updated!.name,
                status: updated!.status,
                statusUpdatedAt: updated!.statusUpdatedAt
            }
        };
    }
}

export const restaurantService = new RestaurantService();


