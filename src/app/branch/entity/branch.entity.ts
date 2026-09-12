import type { Currency } from "../enums.js";

export class Branch {
    id: number;
    restaurantId: number;
    countryCode: string;
    addressText: string;
    label: string;
    lat: number;
    long: number;
    isActive: boolean;
    opensAt: string;
    closesAt: string;
    acceptOrders: boolean;
    createdAt: Date;
    updatedAt: Date;
    deliveryRadius: number;
    currency: Currency | undefined;
    commission?: number;

    constructor(data: Partial<Branch>) {
        this.id = data.id!;
        this.restaurantId = data.restaurantId!;
        this.countryCode = data.countryCode!;
        this.addressText = data.addressText!;
        this.label = data.label!;
        this.lat = data.lat!;
        this.long = data.long!;
        this.isActive = data.isActive!;
        this.opensAt = data.opensAt!;
        this.closesAt = data.closesAt!;
        this.acceptOrders = data.acceptOrders!;
        this.createdAt = data.createdAt ?? new Date();
        this.updatedAt = data.updatedAt ?? new Date();
        this.deliveryRadius = data.deliveryRadius!;
        this.currency = data.currency!;
        this.commission = data.commission ?? 0;
    }
}