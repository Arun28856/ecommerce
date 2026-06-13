import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @Type(() => Number)
    @Min(0)
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsString()
    description: string;

    @Type(() => Number)
    @Min(0)
    @IsNumber()
    stock: number;

    @IsNotEmpty()
    @IsString()
    categorySlug: string;
}