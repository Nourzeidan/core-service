import {AppError} from "../../lib/error/AppError.js";

export const BranchNotFoundError = new AppError('branch is not found!', 404);
export const InvalidBranchIdsError = new AppError('ids must be a comma separated list of branch ids (max 100)', 400);
