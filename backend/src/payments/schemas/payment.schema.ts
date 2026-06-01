import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
    UPI = 'upi',
    CARD = 'card',
    NETBANKING = 'netbanking',
    WALLET = 'wallet',
    EMI = 'emi',
    COD = 'cod',
    CARDLESS_EMI = 'cardless_emi',
    PAY_LATER = 'pay_later',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({required: true})
  buyerId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({default: ''})
  razorpayOrderId: string;

  @Prop({default: ''})
  razorpayPaymentId: string;

  @Prop({ default: '' })
  razorpaySignature: string;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ required: true, enum: PaymentMethod, default: PaymentMethod.UPI })
  method: PaymentMethod;

  @Prop({ default: false })
  isCOD: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);