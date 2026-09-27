import type { UpdateUserrDTO } from "../dto/user.dto.js";
import { UserNotFoundError } from "../errors.js";
import { createUser, findExistingUserByEmailOrPhone, findUserById, updateUser } from "../repository/users.repo.js"
import { SystemRole } from "../enums.js";
import { UserAlreadyExistsError } from "../../auth/errors.js";
import { hashPassword } from "../../auth/utils.js";
import { db } from "../../../common/knex/knex.js";
import type {Knex} from "knex";

interface CreateUserData {
    email: string;
    name: string;
    phone: string;
    password: string;
    systemRole: SystemRole;
}

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

    create = async(data:CreateUserData, conn: Knex = db) => {
        const user = await findExistingUserByEmailOrPhone(data.email, data.phone);
        if(user) throw UserAlreadyExistsError;

        const hashedPassword = await hashPassword(data.password);
        const now = new Date();

        const createdUser = await createUser({
            name: data.name,
            email: data.email,
            passwordHash: hashedPassword,
            phone: data.phone,
            systemRole: data.systemRole,
            createdAt: now,
            updatedAt: now
        }, conn);

        return createdUser;

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