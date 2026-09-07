import { RegisterDTO } from "../dto/auth.dto.js";
import { createUser, findExistingUserByEmailOrPhone } from "../../user/repository/users.repo.js";
import { createAccessToken, createRefreshToken, hashPassword } from "../utils.js";
import { SystemRole } from "../../user/enums.js";
import { UserAlreadyExistsError, CannotSignupAsSystemAdmin } from "../errors.js";
export class AuthService {
    register = async (dto: RegisterDTO) => {
        // 1 check if user already exists by email (fn we did on repository)
        // 2 if exists throw error
        // 3 hash password
        // 4 create user in db (fn we did on repository)
        // 5 create access token & refresh token
        // 6 return the tokens and user info

        if (dto.role === SystemRole.ADMIN) {
            throw CannotSignupAsSystemAdmin;
        }

        const  existingUser = await findExistingUserByEmailOrPhone(dto.email, dto.phone);
        if (existingUser) {
            throw UserAlreadyExistsError;
        }

        const hashedPassword = await hashPassword(dto.password);
        const now = new Date();
        const newUser = await createUser({
            email: dto.email,
            phone: dto.phone,
            name: dto.name,
            passwordHash: hashedPassword,
            systemRole: dto.role,
            createdAt: now,
            updatedAt: now
        });

        const payload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.systemRole
        };

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                phone: newUser.phone,
                name: newUser.name,
                role: newUser.systemRole}};
    }
}

export const authService = new AuthService();