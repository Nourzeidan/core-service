
import { IsString, IsNotEmpty, IsNumber, IsBoolean,IsOptional, IsEnum, Min, IsInt, IsEmail, IsArray} from "class-validator";
import { MemberStatus } from "../enums.js";

export class CreateMemberDTO {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber!: string;


    @IsString()
    @IsNotEmpty()
    role!: string;

    @IsArray()
    @IsInt({ each: true })
    @IsOptional()
    branchIds!: number[];

}

export class UpdateMemberDTO {
    @IsString()
    @IsEnum(MemberStatus)
    @IsOptional()
    status?: MemberStatus;


    @IsString()
    @IsOptional()
    role?: string;

}

export class UpdateMemberBranchesDTO {
    @IsArray()
    @IsInt({ each: true })
    branchIds!: number[];
}


