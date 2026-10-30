import { IsString, IsNotEmpty, IsNumber, IsBoolean,IsOptional, IsEnum, Min, IsInt, IsArray, ArrayNotEmpty, ArrayMaxSize, ValidateNested, MaxLength} from "class-validator";
import { Type } from "class-transformer";


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


// ---- internal (order-service) ----

// POST /api/internal/branches/:id/products/batch
export class BranchProductsBatchDTO {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(200)
    @IsInt({ each: true })
    productIds!: number[];
}

export class StockItemDTO {
    @IsInt()
    productId!: number;

    @IsInt()
    @Min(1)
    quantity!: number;
}

// POST /api/internal/branches/:id/stock/reserve
export class ReserveStockDTO {
    // order-service's public order id: core remembers the reservation under it (for retries and release)
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    orderPublicId!: string;

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(200)
    @ValidateNested({ each: true })
    @Type(() => StockItemDTO) // turns the plain objects into StockItemDTO so their rules run too
    items!: StockItemDTO[];
}

// POST /api/internal/branches/:id/stock/release
export class ReleaseStockDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(64)
    orderPublicId!: string;
}
