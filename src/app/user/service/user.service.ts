import type { UpdateUserrDTO } from "../dto/user.dto.js";
import { UserNotFoundError } from "../errors.js";
import { findUserById, updateUser } from "../repository/users.repo.js"

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
    updateUser = async(data: UpdateUserrDTO, userId: number) => {
        // 1 check user exists
        // 2 update user
        // 3 return user info
        const exist = await findUserById(userId);
        if(!exist){
            throw UserNotFoundError;
        }

        const updated = await updateUser({
            email: data.email,
            phone: data.phone,
            name: data.name,
            updatedAt: new Date()
        }, userId);

        return {
            message: "Profile updated",
            user: {
                id: updated!.id,
                email: updated!.email,
                phone: updated!.phone,
                name: updated!.name,
                role: updated!.systemRole
            }
        }

        
    }
}
// singleton pattern
export const userService = new UserService();