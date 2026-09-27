import { MemberStatus } from "../enums.js";
export class RestaurantMember {
    id: number;
    restaurantId: number;
    userId: number;
    roleId: number;
    roleName: string;
    status: MemberStatus;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<RestaurantMember>) {
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.userId = data.userId!;
        this.roleId = data.roleId!;
        this.roleName = data.roleName!;
        this.status = data.status ?? MemberStatus.ACTIVE;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
    }
}