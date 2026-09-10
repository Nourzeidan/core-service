import {validate, ValidationError} from "class-validator";
// import {AppError} from "../error/error.js";
import {AppError} from "../error/AppError.js";
import {InvalidValidationError} from "../../app/auth/errors.js";
export async function validateBody<T extends Object>(cls: new () => T, body: unknown): Promise<T> {
    const instance = Object.assign(new cls(), body);
    const errors = await validate(instance, { whitelist: true });

    if (errors.length > 0) {
        const errorMessages = errors.flatMap(error => Object.values(error.constraints ?? {}));
        // throw new AppError(400, `Validation failed: ${errorMessages}`);
        
        // throw new Error(`Validation failed: ${errorMessages}`);
        throw InvalidValidationError;
    }

    return instance;
}