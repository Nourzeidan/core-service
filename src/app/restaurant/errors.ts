import {AppError} from "../../lib/error/AppError.js";

export const RestaurantNotFoundError = new AppError('Restaurant is not found!', 404);
export const NotAuthorizedError = new AppError('You must be an admin to update!', 400);
