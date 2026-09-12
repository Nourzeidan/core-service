import { Restaurant } from "../entity/restaurant.entity.js";
import { db } from "../../../common/knex/knex.js";
import type { Knex } from "knex";
const RESTAURANT_COLUMNS = [
    "id",
    "owner_id",
    "name",
    "logo_url",
    "status",
    "primary_country",
    "created_at",
    "updated_at",
    "status_updated_at"
];

function toEntity(restaurant: any): Restaurant {
    return new Restaurant({
        id: restaurant.id,
        ownerId: restaurant.owner_id,
        name: restaurant.name,
        logoURL: restaurant.logo_url,
        status: restaurant.status,
        primaryCountry: restaurant.primary_country,
        createdAt: restaurant.created_at,
        updatedAt: restaurant.updated_at,
        statusUpdatedAt: restaurant.status_updated_at
    });
}

export async function findAllRestaurants(): Promise<Restaurant[]>{
    const rows = await db("restaurants").select(RESTAURANT_COLUMNS);
    return rows.map(toEntity);
}

// find restaurant by id

export async function createRestaurant(data: Partial<Restaurant>, conn:Knex = db):  Promise<Restaurant>{
    const [row] = await conn("restaurants")
        .insert({
            owner_id: data.ownerId,
            name: data.name,
            logo_url: data.logoURL,
            status: data.status,
            primary_country: data.primaryCountry,
            created_at: data.createdAt ?? new Date(),
            updated_at: data.updatedAt ?? new Date(),
            status_updated_at: data.statusUpdatedAt ?? new Date()
        })
        .returning(RESTAURANT_COLUMNS);

    return toEntity(row);
}

export async function findRestaurantById(id: number): Promise<Restaurant>{
    const row = await db("restaurants").select(RESTAURANT_COLUMNS).
    where("id", id);
    return toEntity(row);
}
