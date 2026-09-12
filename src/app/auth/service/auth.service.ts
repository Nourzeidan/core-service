import { RegisterDTO, LoginDTO, ForgetPassDTO, ResetPasswordDTO } from "../dto/auth.dto.js";
import { createUser, findExistingUserByEmailOrPhone, findUserByEmail, findExistingUserByEmail, updateUserPassword } from "../../user/repository/users.repo.js";
import { createAccessToken, createRefreshToken, hashPassword, comparePassword, generateOTP, hashOTP } from "../utils.js";
import { SystemRole } from "../../user/enums.js";
import { UserAlreadyExistsError, CannotSignupAsSystemAdmin, InvalidCredentialsError, InvalidOTPError, RestaurantDataRequiredError } from "../errors.js";
import { createPasswordReset, findLatestPasswordResetByUserid, updatePasswordResetConsumedAt } from "../repository/password-reset.repo.js";
import { hoursToMS, MinsToMS } from "../../../common/time/time.js";
import { restaurantService } from "../../restaurant/service/restaurant.service.js";
import { db } from "../../../common/knex/knex.js";
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

        let newUser;
        const hashedPassword = await hashPassword(dto.password);
        const now = new Date();
        const trx = await db.transaction();
        let restaurant;
        try{
            newUser = await createUser({
                email: dto.email,
                phone: dto.phone,
                name: dto.name,
                passwordHash: hashedPassword,
                systemRole: dto.role,
                createdAt: now,
                updatedAt: now
            }, trx);

            // let restaurant;
            if(dto.role === SystemRole.RESTAURANT_USER){
                if (dto.restaurant === undefined){
                    throw RestaurantDataRequiredError;
                }
                restaurant = await restaurantService.create(newUser.id, dto.restaurant, trx);
                console.log(newUser.id);
            }
            await trx.commit();
        }catch(error){
            await trx.rollback();
            throw(error);
        }

        const payload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.systemRole
        };

        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        return {
            "message": "Signup Successful!",
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                phone: newUser.phone,
                name: newUser.name,
                role: newUser.systemRole,
                createdAt: newUser.createdAt}
            , restaurant};
    }

    login = async (dto: LoginDTO) => {
        // 1 find user by email (fn we did on repository)
        // 2 if not found throw error
        // 3 compare password with hashed password
        // 4 if not match throw error
        // 5 create access token & refresh token
        const user = await findUserByEmail(dto.email);
        if (!user || !(await comparePassword(dto.password, user.passwordHash))) {
            throw InvalidCredentialsError;
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole
        };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

         return {
            "message": "Login Successful!",
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                role: user.systemRole,
                createdAt: user.createdAt
            }};
    }

    forgetPassword = async (dto: ForgetPassDTO) => {
        //1 check if user exists
        // 2 generate an otp and hash it
        // 3 send the otp by email --> later

        const  user = await findUserByEmail(dto.email);

        if(!user){
            // will not return an error because securiy reason not expose the email to hackers
            return
        }

        const otp = generateOTP();

        const hashedOTP = hashOTP(otp);

        const expireTime = 10;
        await createPasswordReset({
            userId: user.id,
            otpHash: hashedOTP,
            expiredAt: new Date(Date.now() + MinsToMS(expireTime)),
            createdAt: new Date()
        });

        // todo: email
        console.log(`email sent ${otp}`);
    }


    resetPassword = async (dto: ResetPasswordDTO) => {
        // find user
        // find reset password
        // verify otp and expiry date
        // update user pass
        // update reset pass
        const user = await findUserByEmail(dto.email);
        if(!user){
            throw InvalidOTPError;
        }

        const reset = await findLatestPasswordResetByUserid(user.id);
         if(!reset){
            throw InvalidOTPError;
        }
        console.log(`${user.id}`);

        const inputOTPHash = hashOTP(dto.otp.toString())
        if(inputOTPHash !== reset.otpHash || reset.isExpired()){
            throw InvalidOTPError;
        }

        const newHashPass = await hashPassword(dto.newPassword);
        await updateUserPassword(user.id, newHashPass);

        await updatePasswordResetConsumedAt(reset.id)
    }
    restaurantService: any;
    

}

export const authService = new AuthService();