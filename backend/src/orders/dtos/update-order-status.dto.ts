import { IsEnum } from 'class-validator';
import {OrderStatus} from '../schemas/orders.schema';

export class updateOrderStatusDto {
    @IsEnum(OrderStatus)
    status: OrderStatus;
}