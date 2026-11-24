import type { RestaurantStatus } from "../enums.js";

export class Restaurant {
    id: number;
    ownerId: number;
    name: string;
    logoURL: string | null;            // NULL = no logo (optional in every DTO)
    status:RestaurantStatus;
    primaryCountry: string;
    createdAt: Date;
    updatedAt: Date;
    statusUpdatedAt: Date;

    constructor(data: Partial<Restaurant>){
        this.id = data.id!;
        this.ownerId = data.ownerId!;
        this.name = data.name!;
        this.logoURL = data.logoURL ?? null;
        this.status = data.status!;
        this.primaryCountry = data.primaryCountry!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.statusUpdatedAt = data.statusUpdatedAt ?? new Date();


    }
}