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

}