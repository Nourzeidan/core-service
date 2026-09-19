import { IsString, IsNotEmpty, IsNumber, IsBoolean,IsOptional, IsEnum, Min, IsInt} from "class-validator";


export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description!: string;

    @IsString()
    @IsOptional()
    imageURL!: string;

    @IsString()
    @IsOptional()
    categoryName!: string;

}

export class UpdateProductDTO {
    @IsString()
    @IsOptional()
    name!: string;

    @IsString()
    @IsOptional()
    description!: string;

    @IsString()
    @IsOptional()
    imageURL!: string;

    @IsString()
    @IsOptional()
    categoryName!: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    price!: number;

    @IsOptional()
    @IsBoolean()
    isAvailable!: boolean;

    @Min(0)
    @IsNumber()
    @IsOptional()
    stock!: number;
}

