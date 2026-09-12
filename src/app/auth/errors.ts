import {AppError} from "../../common/error/AppError.js";

export const UserAlreadyExistsError = new AppError('User Already Exists with same phone or email', 400);

export const CannotSignupAsSystemAdmin = new AppError('You cannot register as a system admin', 403);

export const InvalidCredentialsError = new AppError('Invalid email or password', 401);
export const InvalidOTPError = new AppError('Invalid OTP', 401);
export const InvalidValidationError = new AppError('Incorrect Validations', 400);
export const RestaurantDataRequiredError = new AppError('Restaurant Data required!', 400);
