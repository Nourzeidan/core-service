import {AppError} from "../../common/error/AppError.js";

export const AddressNotFoundError = new AppError('Address is not found!', 400);
