import { MemberBranch } from "../entity/member-branch.entity.js"
import { CreateMemberDTO, UpdateMemberBranchesDTO , UpdateMemberDTO} from "../dto/member.dto.js"
import { CannotCreateOwnerUserError, CannotDeleteOwnerError, InvalidBranchesToRestaurantError, MemberNotFoundError, OwnerHasAllBranchAccessError, RoleNotFoundError } from "../errors.js"
import { createUser, findUserByEmail, findUserById } from "../../user/repository/users.repo.js";
import { UserAlreadyExistsError } from "../../auth/errors.js";
import { findRoleByName } from "../repo/role.repo.js";
import { db } from "../../../lib/knex/knex.js";
import { SystemRole } from "../../user/enums.js";
import { MemberStatus } from "../enums.js";
import { createRestaurantMember, deleteMember, findMembersByRestaurantId, findMemberWithRoleName, updateMember } from "../repo/restaurant-member.repo.js";
import { countBranchesByIdsAndRestaurant, setMemberBranches } from "../repo/member-branch.repo.js";
import { generateOTP, hashOTP } from "../../auth/utils.js";
import { createPasswordReset } from "../../auth/repository/password-reset.repo.js";
import { MinsToMS } from "../../../pkg/utils/time.js";
import { getPermissionsDetailsByRoleName } from "../repo/permission.repo.js";
import type {Knex} from "knex";
import { UserService } from "../../user/service/user.service.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class MemberService {
    constructor(@inject(TOKENS.UserService) private readonly userService: UserService){}
    async createRestaurantMember(restaurantId: number, data: CreateMemberDTO) {
        // dont accept owner role creation
        if(data.role == 'owner'){
            throw CannotCreateOwnerUserError;
        }

        // check id user already exists
        const userExists = await findUserByEmail(data.email);
        if(userExists){
            throw UserAlreadyExistsError;
        }

        // find roleid by role name
        const roleId = await findRoleByName(data.role);
        if(!roleId){
            throw RoleNotFoundError;
        }
        const trx = await db.transaction();
        try{
            // create user, member, assign branches
            const now = new Date();
            const user = await this.userService.create({
                email: data.email,
                name: data.name,
                phone: data.phoneNumber,
                password: '',
                systemRole: SystemRole.RESTAURANT_USER,
            }, trx);

            const member = await createRestaurantMember({
                restaurantId,
                userId: user.id,
                roleId,
                roleName: data.role,
                createdAt: now,
                updatedAt: now,
                status: MemberStatus.INACTIVE
            }, trx);

            const rows = data.branchIds.map( branchId => new MemberBranch({
                branchId: branchId,
                memberId: member.id,
                createdAt: now
            }));
            await setMemberBranches(member.id, rows, trx);
            // generate otp 
            const otp = generateOTP();
            
            const hashedOTP = hashOTP(otp);

            const expireTime = 60;
            await createPasswordReset({
                userId: user.id,
                otpHash: hashedOTP,
                expiredAt: new Date(Date.now() + MinsToMS(expireTime)),
                createdAt: new Date()
            }, trx);

            // todo: email
            console.log(`email sent ${otp}`);

            await trx.commit();
        }catch(err){
            await trx.rollback();
            throw err;
        }
    }

    async createOwnerMember(restaurantId: number, userId: number, conn:Knex=db) {
        const roleName = "owner";
        const role = await findRoleByName(roleName);
        if (!role) throw RoleNotFoundError;
        const createdOwner = await createRestaurantMember(
            {
                restaurantId,
                userId: userId,
                roleId: role,
                roleName: roleName,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: MemberStatus.ACTIVE

            }, conn
        )
        return createdOwner; 
    }

    async listMembers(restaurantId: number) {
        const members = await findMembersByRestaurantId(restaurantId);
        return {data: members};
    }

    async updateMember(restaurantId: number, memberId: number, data: UpdateMemberDTO) {
        const result = await findMemberWithRoleName(memberId);
        if(!result){
            throw MemberNotFoundError;
        }

        if (Number(result.member.restaurantId) !== Number(restaurantId)) {
         throw MemberNotFoundError;
        }

        let roleId: number | undefined;
        if(data.role){
            const foundRoleId = await findRoleByName(data.role);
            if (foundRoleId === null) {
                throw RoleNotFoundError;
            }
            roleId = foundRoleId;
        }

        const updatedMember = await updateMember(memberId, 
        {...(roleId !== undefined ? { roleId } : {}),
         ...(data.status !== undefined ? { status: data.status } : {}),});

        return { data: updatedMember};
    }

    async deleteMember(restaurantId: number, memberId: number) {
        const result = await findMemberWithRoleName(memberId);
        if(!result){
            throw MemberNotFoundError;
        }

        if (Number(result.member.restaurantId) !== Number(restaurantId)) {
         throw MemberNotFoundError;
        }

        if(result.roleName === "owner") throw CannotDeleteOwnerError;

        await deleteMember(memberId);
    }

    async updateMemberBranches(restaurantId: number, memberId: number, data: UpdateMemberBranchesDTO) {
        const result = await findMemberWithRoleName(memberId);
        if(!result){
            throw MemberNotFoundError;
        }
        
        if (Number(result.member.restaurantId) !== Number(restaurantId)) {
         throw MemberNotFoundError;
        }

        if(result.roleName === "owner") throw OwnerHasAllBranchAccessError;

        const count = await countBranchesByIdsAndRestaurant(data.branchIds, restaurantId);

        if(count != data.branchIds.length) throw InvalidBranchesToRestaurantError;

        const rows = data.branchIds.map( branchId => new MemberBranch({
            branchId: branchId,
            memberId: memberId,
            createdAt: new Date()
        }));

        await setMemberBranches(memberId, rows);
         
    } 

    async getRolePermissions(roleName: string) {
            const permissions=await getPermissionsDetailsByRoleName(roleName);
            return {role: roleName, permissions};
    }
}