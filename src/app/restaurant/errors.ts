import {AppError} from "../../lib/error/AppError.js";

export const RestaurantNotFoundError = new AppError('Restaurant is not found!', 404);
export const InvalidRestaurantIdsError = new AppError('ids must be a comma separated list of restaurant ids (max 100)', 400);
export const NotAuthorizedError = new AppError('You must be an admin to update!', 400);
