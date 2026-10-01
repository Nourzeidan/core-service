import { hoursToMS } from "../../../pkg/utils/time.js";
import { getPermissionByRoleName, getPermissionsDetailsByRoleName } from "../repo/permission.repo.js";
export class PermissionCacheService {
    private cache: Map<string, {permissions: string[], cachedAt: number}> = new Map();
    private readonly TTL = hoursToMS(1);

    async getPermissions(roleName: string): Promise<string[]> {
        const cached = this.cache.get(roleName);
        if(cached && Date.now() - cached.cachedAt < this.TTL) {
            return cached.permissions;
        }

        const permissions = await getPermissionByRoleName(roleName);
        this.cache.set(roleName, {permissions, cachedAt: Date.now()});

        return permissions;
    }

    hasPermissions( permissions: string[], resource: string, action: string): boolean {
        return permissions.includes(`${resource}:${action}`);
    }
}

export const permissionCacheService = new PermissionCacheService();