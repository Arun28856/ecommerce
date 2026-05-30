import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    name: string;
    
    @Min(0)
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsString()
    description: string;

    @Min(0)
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    @IsString()
    categorySlug: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}