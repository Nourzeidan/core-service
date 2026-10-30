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
// the owner account created together with the restaurant (same rules as /auth/register)
export class CreateRestaurantOwnerDTO {
    @IsEmail()
    email!: string;

    @MinLength(10)
    @MaxLength(11)
    phone!: string;

    @IsString()
    @MinLength(3)
    name!: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    password!: string;
}

// POST /api/restaurant (system admin)
export class CreateRestaurantDTO {
    @ValidateNested()
    @Type(() => CreateRestaurantOwnerDTO)
    owner!: CreateRestaurantOwnerDTO;

    @IsString()
    @MinLength(1)
    name!: string;

    @IsOptional()
    @IsString()
    logoURL?: string;

    @IsString()
    @MinLength(1)
    primaryCountry!: string;
}
