import {AppError} from "../error/AppError.js";

export const NotAuthenticated = new AppError('Not Authenticated', 400);
export const unAuthorizedError = new AppError('Not Authorized for such Action !', 403);