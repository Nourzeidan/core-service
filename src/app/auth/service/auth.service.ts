import { RegisterDTO, LoginDTO, ForgetPassDTO, ResetPasswordDTO } from "../dto/auth.dto.js";
import { findExistingUserByEmailOrPhone, findUserByEmail, findExistingUserByEmail, updateUserPassword } from "../../user/repository/users.repo.js";
import { createAccessToken, createRefreshToken, hashPassword, comparePassword, generateOTP, hashOTP } from "../utils.js";
import { SystemRole } from "../../user/enums.js";
import { UserAlreadyExistsError, CannotSignupAsSystemAdmin, InvalidCredentialsError, InvalidOTPError, RestaurantDataRequiredError } from "../errors.js";
import { createPasswordReset, findLatestPasswordResetByUserid, updatePasswordResetConsumedAt } from "../repository/password-reset.repo.js";
import { MinsToMS } from "../../../common/time/time.js";
import { RestaurantService, restaurantService } from "../../restaurant/service/restaurant.service.js";
import { db } from "../../../common/knex/knex.js";
import { activateMemberByUserId, findRestaurantMemberWithRole } from "../../rbac/repo/restaurant-member.repo.js";
import { findBranchByMemberId } from "../../rbac/repo/member-branch.repo.js";
import { userService, type UserService } from "../../user/service/user.service.js";
import { memberService, type MemberService } from "../../rbac/service/member.service.js";
import { MemberNotFoundError } from "../../rbac/errors.js";
export class AuthService {
    constructor(
    private readonly restaurantService: RestaurantService,
    private readonly userService: UserService,
    private readonly memberService: MemberService
    ) {}

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
        const trx = await db.transaction();
        let restaurant;
        let restaurantMemberInfo = null;
        try{
            newUser = await this.userService.create({
                email: dto.email,
                phone: dto.phone,
                name: dto.name,
                password: dto.password,
                systemRole: dto.role,
            },trx);

            // let restaurant;
            if(dto.role === SystemRole.RESTAURANT_USER){
                if (dto.restaurant === undefined){
                    throw RestaurantDataRequiredError;
                }
                restaurant = await this.restaurantService.create(newUser.id, dto.restaurant, trx);
                await this.memberService.createOwnerMember(restaurant.id, newUser.id, trx);
                console.log(newUser.id);

                restaurantMemberInfo = {
                restaurantId: restaurant.id,
                restaurantRole: 'owner',
                branchIds: []
                };
            }
            await trx.commit();
        }catch(error){
            await trx.rollback();
            throw(error);
        }

        const payload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.systemRole,
            ...restaurantMemberInfo
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

        let restaurantMemberInfo = null;
        if(user.systemRole == SystemRole.RESTAURANT_USER) {
            const memberData = await findRestaurantMemberWithRole(user.id);
            if(!memberData) throw MemberNotFoundError;
            const branchIds = await findBranchByMemberId(memberData.member.id);
            restaurantMemberInfo = {
                restaurantId: memberData.member.restaurantId,
                restaurantRole: memberData.member.roleName,
                branchIds
            }
        }

        const payload = {
            userId: user.id,
            email: user.email,
            role: user.systemRole,
            ...restaurantMemberInfo
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

        await updatePasswordResetConsumedAt(reset.id);
        return user;
    }
    // restaurantService: any;

    acceptInvite = async(data: ResetPasswordDTO)=>{
        // find user by email
        //find password reset table by id
        // 
        const user = await this.resetPassword(data);
        await activateMemberByUserId(user.id);
    }
    

}

export const authService = new AuthService(restaurantService, userService, memberService);