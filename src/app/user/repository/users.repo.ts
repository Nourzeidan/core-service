import { User } from '../entity/user.entity.js';
import {db} from "../../../common/knex/knex.js";

const USER_COLUMNS = [
    "id",
    "email",
    "phone",
    "name",
    "password_hash",
    "system_role",
    "created_at",
    "updated_at",
    "deleted_at"
]

function toEntity(user: any): User {
    return new User({
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        passwordHash: user.password_hash,
        systemRole: user.system_role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        deletedAt: user.deleted_at
});
}

export async function findUserByEmail(email: string): Promise<User | null> {
    // Implementation for finding user by email
    const user = await db('users').select(USER_COLUMNS)
        .where({ email })
        .whereNull('deleted_at')
        .first();
    if (!user) {
        return null;
    }
    console.log(user);
    return user? toEntity(user) : null;
}

export async function createUser(user: Partial <User>): Promise<User> {
    const [createdUser] = await db('users')
        .insert({
            email: user.email,
            phone: user.phone,
            name: user.name,
            password_hash: user.passwordHash,
            system_role: user.systemRole,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        })
        .returning(USER_COLUMNS);
    return toEntity(createdUser);
}

export async function findExistingUserByEmailOrPhone(email: string, phone: string): Promise<User | null> {
    const user = await db.raw(`
        SELECT EXISTS (SELECT 1 FROM users WHERE email = ? OR phone = ?
        AND deleted_at IS NULL) AS exists
    `, [email, phone]);
    console.log(user);
    // return user ? toEntity(user) : null;
    return user.rows[0].exists;
}

export async function findExistingUserByEmail(email: string): Promise<User | null> {
    const user = await db.raw(`
        SELECT EXISTS (SELECT 1 FROM users WHERE email = ?
        AND deleted_at IS NULL) AS exists
    `, [email]);
    console.log(user);
    // return user ? toEntity(user) : null;
    return user.rows[0].exists;
}

export async function updateUserPassword(id: number, pass: string){
    await db("users").where("id", id)
    .update({password_hash: pass});
}

export async function findUserById(id: number): Promise<User | null> {
    // Implementation for finding user by email
    const user = await db('users').select(USER_COLUMNS)
        .where({ id })
        .whereNull('deleted_at')
        .first();
    if (!user) {
        return null;
    }
    console.log(user);
    return user? toEntity(user) : null;
}