import { IsString, IsNotEmpty, IsNumber, IsBoolean,IsOptional, IsEnum, Min, IsInt} from "class-validator";
import { Currency } from "../enums.js";

export class CreateBranchDTO {
    @IsString()
    @IsNotEmpty()
    countryCode!: string;

    @IsString()
    @IsNotEmpty()
    label!: string;
    @IsString()
    @IsNotEmpty()
    addressText!: string;

    @IsNumber()
    lat!: number;

    @IsNumber()
    long!: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsString()
    @IsNotEmpty()
    opensAt!: string;

    @IsString()
    @IsNotEmpty()
    closesAt!: string;

    @IsBoolean()
    @IsOptional()
    acceptOrders?: boolean;

    @IsInt()
    @Min(0)
    deliveryRadius!: number;

    @IsEnum(Currency)
    currency?: Currency;

    // minor units: 1500 = 15.00 in the branch currency
    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryFee?: number;

}


export class UpdateBranchDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    countryCode!: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    label!: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    addressText!: string;

    @IsOptional()
    @IsNumber()
    lat!: number;

    @IsOptional()
    @IsNumber()
    long!: number;

    @IsOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    opensAt!: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    closesAt!: string;

    @IsOptional()
    @IsBoolean()
    @IsOptional()
    acceptOrders?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryRadius!: number;
    
    @IsOptional()
    @IsEnum(Currency)
    currency?: Currency;

    @IsOptional()
    @IsInt()
    @Min(0)
    deliveryFee?: number;

}

// admin only: switch a branch on/off. Off -> order-service rejects new orders for it
export class UpdateBranchStatusDTO {
    @IsBoolean()
    isActive!: boolean;
}