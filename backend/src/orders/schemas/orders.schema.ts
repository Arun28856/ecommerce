import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Schema({_id: false})
export class orderItem {
  @Prop({required: true})
  product: Types.ObjectId;

  @Prop({required: true})
  name: string;

  @Prop({required: true})
  price: number;

  @Prop({required: true, min: 1})
  quantity: number;

  @Prop({required: true})
  sellerUid: string;

  @Prop({default: ''})
  image: string;

}

@Schema({_id: false})
export class ShippingAddress {

    @Prop({required: true})
    fullName: string;

    @Prop({required: true})
    phone: string;

    @Prop({required: true})
    address: string;

    @Prop({required: true})
    city: string;

    @Prop({required: true})
    state: string;

    @Prop({required: true})
    postalCode: string;
}

@Schema({timestamps: true})
export class Order {
  @Prop({required: true})
  buyerUid: Types.ObjectId;

  @Prop({required: true, type: [orderItem]})
  orderItems: orderItem[];

  @Prop({required: true, type: ShippingAddress})
  shippingAddress: ShippingAddress;

  @Prop({required: true})
  totalPrice: number;

  @Prop({required: true, enum: OrderStatus, default: OrderStatus.PENDING})
  status: OrderStatus;

  @Prop({default: ''})
  paymentId: string;

  @Prop({default: false})
  isPaid: boolean;

  createdAt!: Date;
  updatedAt!: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({buyerUid: 1});
OrderSchema.index({'orderItems.sellerUid': 1});


