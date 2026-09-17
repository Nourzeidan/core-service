import {AppError} from "../../common/error/AppError.js";

export const BranchNotFoundError = new AppError('branch is not found!', 404);
