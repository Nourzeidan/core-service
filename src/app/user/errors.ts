import {AppError} from "../../common/error/AppError.js";

export const UserNotFoundError = new AppError('User is not found!', 400);
