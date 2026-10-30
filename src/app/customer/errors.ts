import {AppError} from "../../lib/error/AppError.js";

export const AddressNotFoundError = new AppError('Address is not found!', 400);
// 404 (not 400): order-service maps a 404 to "address not found" for the checkout.
// also used when the address exists but belongs to another user, so ids can't be probed
export const AddressNotOwnedError = new AppError('Address is not found!', 404);
