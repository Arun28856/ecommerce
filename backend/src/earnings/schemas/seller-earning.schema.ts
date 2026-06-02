import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SellerEarningDocument = SellerEarning & Document;

export enum EarningStatus {
  PENDING = 'pending',      // Payment done, order in progress
  AVAILABLE = 'available',  // Order delivered, ready to pay out
  PAID_OUT = 'paid_out',    // Transferred to seller
}

@Schema({ timestamps: true })
export class SellerEarning {
  @Prop({ required: true })
  sellerUid: string;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true })
  payment: Types.ObjectId;

  @Prop({ required: true })
  grossAmount: number;

  @Prop({ required: true })
  platformFeePercentage: number;

  @Prop({ required: true })
  platformFeeAmount: number;

  @Prop({ required: true })
  netAmount: number;

  @Prop({ required: true, enum: EarningStatus, default: EarningStatus.PENDING })
  status: EarningStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const SellerEarningSchema = SchemaFactory.createForClass(SellerEarning);
SellerEarningSchema.index({ sellerUid: 1 });
SellerEarningSchema.index({ order: 1 });
