import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class BankDetails {
  @Prop()
  accountHolderName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  ifscCode: string;

  @Prop()
  bankName: string;

  @Prop()
  upiId?: string;
}

export const BankDetailsSchema = SchemaFactory.createForClass(BankDetails);

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  uid: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  name: string;

  @Prop()
  avatar: string;

  @Prop({ default: 'buyer', enum: ['buyer', 'seller'] })
  role: string;

  @Prop({ type: BankDetailsSchema })
  bankDetails?: BankDetails;
}

export const UserSchema = SchemaFactory.createForClass(User);