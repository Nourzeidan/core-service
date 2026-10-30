import { Restaurant } from "../entity/restaurant.entity.js";
import { db } from "../../../lib/knex/knex.js";
import type { Knex } from "knex";
import { applyCursorPagination, applyFilters, type FilterParams, type PaginationParams } from "../../../lib/http/pagination/cursor-pagination.js";
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

export async function findAllRestaurants(params: PaginationParams, filters: FilterParams[]): Promise<Restaurant[]>{
    let query = db("restaurants").select(RESTAURANT_COLUMNS);
    query = applyFilters(query, filters);
    query = applyCursorPagination(query, params);
    const rows = await query;
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

export async function updateRestaurant(data: Partial<Restaurant>, id: number): Promise<Restaurant> {
    const [row] = await db("restaurants")
    .update({
        owner_id: data.ownerId,
        name: data.name,
        logo_url: data.logoURL,
        primary_country: data.primaryCountry,
        updated_at: data.updatedAt ?? new Date()
        // status_updated_at: data.statusUpdatedAt ?? new Date()
    })
    .where("id", id)
    .returning(RESTAURANT_COLUMNS);
    console.log('UPDATE RESULT:', row); console.log('DB CONFIG:', await db.raw('SELECT current_database(), inet_server_addr(), inet_server_port()')); 
    return toEntity(row);

}  

// conn: pass the service's trx so the outbox event commits together with the status change
export async function updateRestaurantStatus(data: Partial<Restaurant>, id: number, conn: Knex = db): Promise<Restaurant> {
    const [row] = await conn("restaurants")
    .update({
        status: data.status,
        status_updated_at: data.statusUpdatedAt ?? new Date()
    })
    .where("id", id)
    .returning(RESTAURANT_COLUMNS);
    return toEntity(row);

}  

export async function findRestaurantById(id: number): Promise<Restaurant | null>{
    const [row] = await db("restaurants").select(RESTAURANT_COLUMNS).
    where("id", id);
    if(!row){
        return null;
    }
    console.log(row);
    return toEntity(row);
}
