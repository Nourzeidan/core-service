import {IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Max, MaxLength, Min, MinLength} from "class-validator";
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