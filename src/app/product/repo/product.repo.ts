import { Product } from "../entity/product.entity.js";
import type { Knex } from "knex";
import {db} from "../../../lib/knex/knex.js";
import { ProductNotFoundError } from "../errors.js";
const PRODUCT_COLUMNS = [
    "id",
    "name",
    "description",
    "image_url",
    "restaurant_id",
    "category_id",
    "created_at",
    "updated_at",
    "deleted_at"
];

function toEntity(product: any): Product {
    return new Product({
        id: product.id,
        name: product.name,
        description: product.description,
        imageURL: product.image_url,
        restaurantId: product.restaurant_id,
        categoryId: product.category_id,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        deletedAt: product.deleted_at
    });
}

export async function createProduct(product: Partial <Product>, restaurantId: number, conn: Knex = db): Promise<Product> {
    const [createdProduct] = await conn('products')
    .insert({
        name: product.name,
        description: product.description,
        image_url: product.imageURL,
        restaurant_id: restaurantId,
        category_id: product.categoryId,
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        deleted_at: product.deletedAt ?? null,
    })
    .returning(PRODUCT_COLUMNS);
    return toEntity(createdProduct);
}

export async function findProductsByBranch(branchId: number): Promise<Product[]>{
    const result = await db.raw(`
        SELECT b.price, b.stock, b.is_available, c.name AS category_name, p.id, p.restaurant_id, p.name,
         p.description, p.image_url, c.id AS category_id
        FROM product_branch_details b 
        JOIN products p ON b.product_id = p.id
        LEFT JOIN product_categories c ON p.category_id = c.id 
        WHERE b.branch_id = ?`, [branchId]);

    return result.rows;
}

export async function findProductsByRestaurant(restaurantId: number): Promise<Product[]> {
    const result = await db("products")
    .select(PRODUCT_COLUMNS)
    .where("restaurant_id", restaurantId)
    .whereNull('deleted_at');

    return result.map(toEntity);
}

export async function findProductById(id: number): Promise<Product | null> {
    const [row] = await db("products")
    .select(PRODUCT_COLUMNS)
    .where("id", id)
    .whereNull('deleted_at');

    if (!row) {
        return null;
    }

    return toEntity(row);
}

export async function updateProduct(product: Partial <Product>, id: number, conn: Knex = db): Promise<Product | null> {
     const [updatedProduct] = await conn('products')
    .update({
        name: product.name,
        description: product.description,
        category_id: product.categoryId,
        image_url: product.imageURL,
        updated_at: product.updatedAt ?? new Date()
    })
    .where("id", id)
    .returning(PRODUCT_COLUMNS);

    if(!updatedProduct){
        return null;
    }
    return toEntity(updatedProduct);
}