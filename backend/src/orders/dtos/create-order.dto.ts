import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from 'class-validator';
import {Type} from 'class-transformer';

export class orderItemDto {
    @IsNotEmpty()
    @IsString()
    productSlug: string;

    @IsNumber()
    @Min(1)
    quantity: number;

}

export class shippingAddressDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    phone: string; 

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    state: string;

    @IsNotEmpty()
    @IsString()
    postalCode: string;
}

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => orderItemDto)
    items: orderItemDto[];

    @ValidateNested()
    @Type(() => shippingAddressDto)
    shippingAddress: shippingAddressDto;
}