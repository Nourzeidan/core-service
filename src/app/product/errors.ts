import {AppError} from "../../lib/error/AppError.js";

export const ProductNotFoundError = new AppError('product is not found!', 404);

// 409 = "conflicts with the current state": not enough stock left. The message lists the
// products that ran out, e.g. Out of stock: [{"productId":3,"requested":2,"available":1}]
export function outOfStockError(items: {productId: number; requested: number; available: number}[]) {
    return new AppError(`Out of stock: ${JSON.stringify(items)}`, 409);
}
