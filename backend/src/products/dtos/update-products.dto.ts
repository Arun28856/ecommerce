import { IsArray, IsBIC, IsBoolean, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateProductDto {

    @IsOptional()
    @IsString()
    name: string;
    
    @Min(0)
    @IsNumber()
    @IsOptional()
    price: number;

    @IsOptional()
    @IsString()
    description: string;

    @Min(0)
    @IsNumber()
    @IsOptional()
    stock: number;

    @IsOptional()
    @IsString()
    categorySlug: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}