import { PaymentMethod } from "../schemas/payment.schema";
import { IsString, IsEnum, IsNotEmpty } from "class-validator";

export class CreatePaymentDto {

    @IsString()
    @IsNotEmpty()
    order: string;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;
}