import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

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
}

export const UserSchema = SchemaFactory.createForClass(User);