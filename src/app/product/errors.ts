import {AppError} from "../../lib/error/AppError.js";

export const ProductNotFoundError = new AppError('product is not found!', 404);
