import { findUserById } from "../../user/repository/users.repo.js";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo.js";
import { createProduct, findProductsByBranch, findProductsByRestaurant, findProductById, updateProduct } from "../repo/product.repo.js";
import { findCategoryByRestaurantAndName, findCategoryByRestaurant } from "../repo/product-category.repo.js";
import { UserNotFoundError } from "../../user/errors.js";
import { unAuthorizedError } from "../../../common/auth/errors.js";
import { RestaurantNotFoundError } from "../../restaurant/errors.js";
import { SystemRole } from "../../user/enums.js";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto.js";
import { createCategory } from "../repo/product-category.repo.js";
import {db} from "../../../common/knex/knex.js";
import { findBranchById } from "../../branch/repository/branch.repo.js";
import { BranchNotFoundError } from "../../branch/errors.js";
import { ProductNotFoundError } from "../errors.js";
import { updateBranchDetails } from "../repo/product-branch.repo.js";

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


}
export const productService = new ProductService();
