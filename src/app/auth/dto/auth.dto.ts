import {IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Length, Max, MaxLength, Min, MinLength} from "class-validator";
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