import {IsEmail, IsOptional, IsString, MaxLength, MinLength} from "class-validator";

export class UpdateUserrDTO {
    @IsOptional()
    @IsEmail()
    email!: string;

    @IsOptional()
    @MinLength(10)
    @MaxLength(11)
    phone!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    name!: string;
    
}