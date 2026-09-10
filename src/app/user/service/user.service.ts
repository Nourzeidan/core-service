import { SystemRole } from "../enums.js";
import { UserNotFoundError } from "../errors.js";
import { findUserById } from "../repository/users.repo.js"

export class UserService {
    getByUserId = async(userId: number) => {
        const user = await findUserById(userId);

        if(!user) {
            throw UserNotFoundError;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.systemRole
        }
    }
}
// singleton pattern
export const userService = new UserService();