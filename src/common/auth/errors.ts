import {AppError} from "../error/AppError.js";

export const NotAuthenticated = new AppError('Not Authenticated', 400);