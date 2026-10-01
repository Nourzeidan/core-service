import { AppError } from "../../lib/error/AppError.js";

export const CannotCreateOwnerUserError = new AppError('Not allowed to create', 404);
export const RoleNotFoundError = new AppError('Role not found error!', 404);
export const MemberNotFoundError = new AppError('Member not found', 404);
export const CannotDeleteOwnerError = new AppError('Cannot delete the restaurant owner', 400);
export const InvalidBranchesToRestaurantError = new AppError('some branches do not belong to this restaurant', 404);
export const OwnerHasAllBranchAccessError = new AppError('Owner already has access to all branches', 400);