import { ProductCategory } from "../entity/product-categories.entity.js";
import type { Knex } from "knex";
import {db} from "../../../lib/knex/knex.js";


const PRODUCT_CATEGORY_COLUMNS = [
    "id",
    "restaurant_id",
    "name",
    "created_at",
    "updated_at"
];

function toEntity(category: any): ProductCategory {
    return new ProductCategory({
        id: category.id,
        restaurantId: category.restaurant_id,
        name: category.name,
        createdAt: category.created_at,
        updatedAt: category.updated_at
    });
}

export async function createCategory(category: Partial<ProductCategory>, restaurantId: number, conn: Knex = db): Promise<ProductCategory> {
    const [createdCategory] = await conn('product_categories')
    .insert({
        name: category.name,
        restaurant_id: restaurantId,
        created_at: category.createdAt ?? new Date(),
        updated_at: category.updatedAt ?? new Date()
    })
    .returning(PRODUCT_CATEGORY_COLUMNS);
    return toEntity(createdCategory);
}

export async function findCategoryByRestaurantAndName(restaurantId: number, name: string, conn: Knex = db): Promise<ProductCategory | null> {
    const [result] = await conn('product_categories')
    .select(PRODUCT_CATEGORY_COLUMNS)
    .where({restaurant_id:restaurantId, name});
    return result? toEntity(result) : null;
}

export async function findCategoryByRestaurant(restaurantId: number, conn: Knex = db): Promise<ProductCategory | null> {
    const [result] = await conn('product_categories')
    .select(PRODUCT_CATEGORY_COLUMNS)
    .where("restaurant_id",restaurantId);
    return result? toEntity(result) : null;
}