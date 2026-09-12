import { Type } from "../enums.js";
export class CustomerAddress {
    id: number;
    userId: number;
    label: string;
    lat: number;
    lng: number;
    country: string;
    building: string | undefined;
    apartment: string | undefined;
    city: string;
    street: string;
    type: Type;
    createdAt: Date;
    isDefault: boolean;

    constructor(data: Partial<CustomerAddress>){
        this.id = data.id!
        this.userId = data.userId!
        this.label = data.label!
        this.lat = data.lat!
        this.lng = data.lng!
        this.apartment = data.apartment
        this.country = data.country!
        this.building = data.building
        this.city = data.city!
        this.street = data.street!
        this.type = data.type!
        this.createdAt = data.createdAt!
        this.isDefault = data.isDefault!
    }

}