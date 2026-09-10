import { PasswordReset } from "../entity/password-reset.entity.js";
import {db} from "../../../common/knex/knex.js";

const PASSWORD_COLUMNS = [
    "id",
    "user_id",
    "otp_hash",
    "expired_at",
    "created_at",
    "consumed_at"
];

function toEntity(pass: any): PasswordReset {
    return new PasswordReset({
        id: pass.id,
        userId: pass.user_id,
        otpHash: pass.otp_hash,
        expiredAt: pass.expired_at,
        createdAt: pass.created_at,
        consumedAt: pass.consumed_at
 } );
}

export async function createPasswordReset(PasswordReset: Partial <PasswordReset>){
    const [row] = await db('password_resets').insert({
        user_id: PasswordReset.userId,
        otp_hash: PasswordReset.otpHash,
        created_at: PasswordReset.createdAt,
        expired_at: PasswordReset.expiredAt
}).returning(PASSWORD_COLUMNS);
    
    return toEntity(row);
    
}

export async function findLatestPasswordResetByUserid(userId: number){
    const row = await db("password_resets")
    .select(PASSWORD_COLUMNS)
    .where("user_id", userId)
        .whereNull('consumed_at')
        .orderBy('id', 'desc')
        .first();
     if (!row) return null;
    return toEntity(row);
}

export async function updatePasswordResetConsumedAt(id: number) {
    await db("password_resets")
    .where('id', id)
    .update({
        consumed_at: new Date
    })
}