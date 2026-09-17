import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length, Max, MaxLength, Min, MinLength, ValidateNested} from "class-validator";
import { Type } from "class-transformer";
import { SystemRole } from "../../user/enums.js";
import { RestaurantStatus } from "../enums.js";
export class UpdateRestaurantDTO {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name!: string;

    @IsOptional()
    @IsString()
    logoURL?: string;

    @IsOptional()
    @IsString()
    @MinLength(1)
    primaryCountry!: string;

}

export class UpdateRestaurantStatusDTO {
    @IsEnum(RestaurantStatus)
    status!: RestaurantStatus;
}