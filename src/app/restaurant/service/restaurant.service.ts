import type { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto.js";
import { Restaurant } from "../entity/restaurant.entity.js";
import { RestaurantStatus } from "../enums.js";
import { createRestaurant, findAllRestaurants } from "../repository/restaurant.repo.js";

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
}

export const restaurantService = new RestaurantService();


