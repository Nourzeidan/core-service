import {AppError} from "../error/AppError.js";

// 401 (was 400): clients/order-service treat 401 as "token missing or expired -> call /auth/refresh"
export const NotAuthenticated = new AppError('Not Authenticated', 401);
export const unAuthorizedError = new AppError('Not Authorized for such Action !', 403);

// service-to-service (/api/internal/*)
export const InvalidApiKeyError = new AppError('Invalid api key', 401);
export const InternalApiNotConfiguredError = new AppError('Internal api key not configured', 503);
