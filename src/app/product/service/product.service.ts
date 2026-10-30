import { findUserById } from "../../user/repository/users.repo.js";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo.js";
import { createProduct, findProductsByBranch, findProductsByRestaurant, findProductById, updateProduct } from "../repo/product.repo.js";
import { findCategoryByRestaurantAndName, findCategoryByRestaurant } from "../repo/product-category.repo.js";
import { UserNotFoundError } from "../../user/errors.js";
import { unAuthorizedError } from "../../../lib/auth/errors.js";
import { RestaurantNotFoundError } from "../../restaurant/errors.js";
import { SystemRole } from "../../user/enums.js";
import { CreateProductDTO, UpdateProductDTO, type ReleaseStockDTO, type ReserveStockDTO } from "../dto/product.dto.js";
import { insertOutboxEvent } from "../../../lib/events/outbox.repo.js";
import { EVENT_TYPES } from "../../../lib/events/event-types.js";
import { changeBranchStock, findBranchProductsByIds, lockBranchStock } from "../repo/product-branch.repo.js";
import { createReservations, findReservationsByOrder, markReservationReleased } from "../repo/stock-reservation.repo.js";
import { outOfStockError } from "../errors.js";
import { ReservationStatus } from "../enums.js";
import { createCategory } from "../repo/product-category.repo.js";
import {db} from "../../../lib/knex/knex.js";
import { findBranchById } from "../../branch/repository/branch.repo.js";
import { BranchNotFoundError } from "../../branch/errors.js";
import { ProductNotFoundError } from "../errors.js";
import { updateBranchDetails } from "../repo/product-branch.repo.js";
import { injectable } from "tsyringe";


@injectable()
export class ProductService {
    create = async(userId: number, restaurantId: number, userRole: SystemRole, data: CreateProductDTO) => {
        const user = await findUserById(userId);
        if(!user){
            throw UserNotFoundError;
        }

        const restaurant = await findRestaurantById(restaurantId);
        if(!restaurant){
            throw RestaurantNotFoundError;
        }

        if(userRole != SystemRole.ADMIN && restaurant.ownerId != userId) {
            throw unAuthorizedError;
        }

        const now = new Date();
        const trx = await db.transaction();
        // let product;
        try{
            let categoryId: number | null = null;
            if (data.categoryName) {
                const existing = await findCategoryByRestaurantAndName(restaurantId, data.categoryName, trx);
                if (existing) {
                    categoryId = existing.id;
                } else {
                    const newCategory = await createCategory({
                        restaurantId: restaurantId,
                        name: data.categoryName,
                        createdAt: now,
                        updatedAt: now
                }, restaurantId, trx);  
                    categoryId = newCategory.id;
                }
            }

            const product = await createProduct({
                restaurantId: restaurantId,
                name: data.name,
                description: data.description,
                imageURL: data.imageURL,
                categoryId: categoryId,
                createdAt: now,
                updatedAt: now,
            }, restaurantId, trx);

            await trx.commit();
             return {
            message: "Product Created",
            product: {
                id: product.id,
                restaurantId: product.restaurantId,
                name: product.name,
                description: product.description,
                imageUrl: product.imageURL,
                categoryId: product.categoryId,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            }
        }
        }catch(error){
            await trx.rollback();
            throw(error);
        }
    }

    findCategories = async(restaurantId: number) => {
        const restaurant = await findRestaurantById(restaurantId);
        if(!restaurant){
            throw RestaurantNotFoundError;
        }

        const categories = await findCategoryByRestaurant(restaurantId);
        return categories;
    }

    findByBranch = async(branchId: number) => {
        const branch = await findBranchById(branchId);
        if(!branch){
            throw BranchNotFoundError;
        }

        const products = await findProductsByBranch(branchId);
        return products;
    }

    findByRestaurant = async(userId: number, restaurantId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if(!restaurant){
            throw RestaurantNotFoundError;
        }
        if(userRole != SystemRole.ADMIN && restaurant.ownerId != userId) {
            throw unAuthorizedError;
        }
        const products = await findProductsByRestaurant(restaurantId);
        return products;
    }

    findById = async(productId: number) => {
        const product = await findProductById(productId);
        if(!product){
            throw ProductNotFoundError;
        }
        return product;
    }

    update = async(userId: number, productId: number, branchId: number | null, 
         data: UpdateProductDTO) => {
        const product = await findProductById(productId);
            if (!product) {
                throw ProductNotFoundError;
            }

            const restaurant = await findRestaurantById(product.restaurantId);
            if (!restaurant) {
                throw RestaurantNotFoundError;
            }

            const user = await findUserById(userId);
            if (!user) {
                throw UserNotFoundError;
            }

            if (user.systemRole != SystemRole.ADMIN && restaurant.ownerId != userId) {
                throw unAuthorizedError;
            }

            const now = new Date();
            const trx = await db.transaction();

            try {
                let categoryId: number | null = product.categoryId;
                if (data.categoryName) {
                    const existing = await findCategoryByRestaurantAndName(restaurant.id, data.categoryName, trx);
                    if (existing) {
                        categoryId = existing.id;
                    } else {
                        const newCategory = await createCategory({
                            restaurantId: restaurant.id,
                            name: data.categoryName,
                            createdAt: now,
                            updatedAt: now
                        }, restaurant.id, trx);
                        categoryId = newCategory.id;
                    }
                }

                const updatedProduct = await updateProduct({
                    name: data.name,
                    description: data.description,
                    imageURL: data.imageURL,
                    categoryId: categoryId,
                    updatedAt: now
                }, productId, trx);

                let branchDetails = null;
                const hasBranchFields = data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined;

                if (branchId && hasBranchFields) {
                    branchDetails = await updateBranchDetails({
                        price: data.price,
                        stock: data.stock,
                        isAvailable: data.isAvailable,
                        updatedAt: now
                    }, branchId, productId, trx);

                    // same trx as the update -> order-service hears about it exactly when it is committed
                    if (branchDetails && data.price !== undefined) {
                        await insertOutboxEvent({
                            aggregateType: "product_branch_details",
                            aggregateId: `${branchId}:${productId}`,
                            eventType: EVENT_TYPES.PRODUCT_PRICE_CHANGED,
                            payload: {branchId, productId, price: String(branchDetails.price)}
                        }, trx);
                    }
                    if (branchDetails && (data.stock !== undefined || data.isAvailable !== undefined)) {
                        await insertOutboxEvent({
                            aggregateType: "product_branch_details",
                            aggregateId: `${branchId}:${productId}`,
                            eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                            payload: {branchId, productId, stock: Number(branchDetails.stock), isAvailable: branchDetails.isAvailable}
                        }, trx);
                    }
                }

                await trx.commit();

                return {
                    message: "Product updated",
                    product: updatedProduct,
                    ...(branchDetails ? { branchDetails } : {})
                };
            } catch (error) {
                await trx.rollback();
                throw error;
            }
        }

    // ---- used by order-service (internal routes) ----

    // cart snapshot: name / price / stock of the given products in one branch
    findBranchProducts = async (branchId: number, productIds: number[]) => {
        await findBranchById(branchId); // throws BranchNotFoundError (404)
        return findBranchProductsByIds(branchId, [...new Set(productIds)]);
    }

    // Takes the stock an order needs, all or nothing:
    //   - every product has enough stock -> all are decremented, 204
    //   - one product is short           -> nothing changes, 409 listing the short products
    // Safe to retry: the reservation is saved under orderPublicId, so a second call for the
    // same order (order-service retries on timeouts) does not decrement a second time.
    reserveStock = async (branchId: number, data: ReserveStockDTO) => {
        await findBranchById(branchId); // throws BranchNotFoundError (404)

        // the same product twice in the cart -> one line with the summed quantity
        const quantities = new Map<number, number>();
        for (const item of data.items) {
            quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
        }
        const productIds = [...quantities.keys()];

        const trx = await db.transaction();
        try {
            const existing = await findReservationsByOrder(data.orderPublicId, branchId, trx);
            if (existing.length > 0) {
                // retry of a reservation that already succeeded
                await trx.commit();
                return;
            }

            const rows = await lockBranchStock(branchId, productIds, trx);
            const stockByProduct = new Map(rows.map(row => [Number(row.productId), row]));

            const shortItems: {productId: number; requested: number; available: number}[] = [];
            for (const [productId, requested] of quantities) {
                const row = stockByProduct.get(productId);
                const available = row && row.isAvailable ? Number(row.stock) : 0;
                if (available < requested) {
                    shortItems.push({productId, requested, available});
                }
            }
            if (shortItems.length > 0) {
                throw outOfStockError(shortItems);
            }

            const now = new Date();
            for (const [productId, requested] of quantities) {
                const {stock, isAvailable} = await changeBranchStock(branchId, productId, -requested, trx);
                await insertOutboxEvent({
                    aggregateType: "product_branch_details",
                    aggregateId: `${branchId}:${productId}`,
                    eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: {branchId, productId, stock, isAvailable}
                }, trx);
            }
            await createReservations(productIds.map(productId => ({
                orderPublicId: data.orderPublicId,
                branchId,
                productId,
                quantity: quantities.get(productId)!,
                createdAt: now
            })), trx);

            await trx.commit();
        } catch (error) {
            await trx.rollback();
            // two retries of the same order arrived at the same time: the other one already
            // reserved (unique_violation on the reservation key) -> same result as a retry
            if ((error as {code?: string}).code === UNIQUE_VIOLATION) {
                return;
            }
            throw error;
        }
    }

    // Gives the stock of a cancelled / rejected order back.
    // Safe to retry: released reservations are skipped, an unknown order is a no-op.
    releaseStock = async (branchId: number, data: ReleaseStockDTO) => {
        const trx = await db.transaction();
        try {
            const reservations = await findReservationsByOrder(data.orderPublicId, branchId, trx, true);

            for (const reservation of reservations) {
                if (reservation.status !== ReservationStatus.RESERVED) {
                    continue;
                }
                const {stock, isAvailable} = await changeBranchStock(branchId, reservation.productId, reservation.quantity, trx);
                await markReservationReleased(reservation.id, trx);
                await insertOutboxEvent({
                    aggregateType: "product_branch_details",
                    aggregateId: `${branchId}:${reservation.productId}`,
                    eventType: EVENT_TYPES.PRODUCT_STOCK_CHANGED,
                    payload: {branchId, productId: reservation.productId, stock, isAvailable}
                }, trx);
            }

            await trx.commit();
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

}

// postgres error code for a UNIQUE constraint violation
const UNIQUE_VIOLATION = "23505";
