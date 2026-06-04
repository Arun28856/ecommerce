import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ArrayMinSize,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../payments/schemas/payment.schema';
import { shippingAddressDto } from '../../orders/dtos/create-order.dto';

export class CartItemDto {
  @IsString()
  @IsNotEmpty()
  productSlug: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ValidateNested()
  @Type(() => shippingAddressDto)
  shippingAddress: shippingAddressDto;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}