import {IsEnum, IsString, IsOptional, IsNumber, IsBoolean} from "class-validator";
import { Type } from "../enums.js";

export class CreateAddressDTO {
     @IsString()
    label!: string

    @IsString()
    country!: string

    @IsString()
    city!: string

    @IsString()
    street!: string

    @IsOptional()
    @IsString()
    building?: string

    @IsOptional()
    @IsString()
    apartment?: string

    @IsEnum(Type)
    type!: Type

    @IsNumber()
    lat!: number

    @IsNumber()
    lng!: number

    @IsBoolean()
    isDefault!: boolean
}

export class UpdateAddressDTO {
    @IsOptional()
     @IsString()
    label!: string

    @IsOptional()
    @IsString()
    country!: string

    @IsOptional()
    @IsString()
    city!: string

    @IsOptional()
    @IsString()
    street!: string

    @IsOptional()
    @IsString()
    building?: string

    @IsOptional()
    @IsString()
    apartment?: string

    @IsOptional()
    @IsEnum(Type)
    type!: Type

    @IsOptional()
    @IsNumber()
    lat!: number

    @IsOptional()
    @IsNumber()
    lng!: number

    @IsOptional()
    @IsBoolean()
    isDefault!: boolean
}