import { IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateProductDto {

    @IsOptional()
    @IsString()
    name: string;

    @Type(() => Number)
    @Min(0)
    @IsNumber()
    @IsOptional()
    price: number;

    @IsOptional()
    @IsString()
    description: string;

    @Type(() => Number)
    @Min(0)
    @IsNumber()
    @IsOptional()
    stock: number;

    @IsOptional()
    @IsString()
    categorySlug: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}