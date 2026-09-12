import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length, Max, MaxLength, Min, MinLength, ValidateNested} from "class-validator";
import { Type } from "class-transformer";
import { SystemRole } from "../../user/enums.js";
export class RegisterDTO {
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

    @IsEnum(SystemRole)
    role!: SystemRole;

    @IsOptional()
    @ValidateNested() // validate what is inside register restaurant
    @Type(() => RegisterRestaurantDTO)
    restaurant?: RegisterRestaurantDTO;
}

export class LoginDTO {
    @IsEmail()
    email!: string;
   
    @IsString()
    @IsNotEmpty()
    password!: string;
}

export class ForgetPassDTO {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDTO {
    @IsEmail()
    email!: string;

    @IsString()
    @Length(6)
    otp!: string;

    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    newPassword!: string;

}

export class RegisterRestaurantDTO {
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