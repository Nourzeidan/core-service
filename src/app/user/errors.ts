import {AppError} from "../../lib/error/AppError.js";

export const UserNotFoundError = new AppError('User is not found!', 400);
export const InvalidUserIdsError = new AppError('ids must be a comma separated list of user ids (max 100)', 400);
