import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  description: string;

  @Prop({required: true, min: 0, default: 0})
  stock: number;

  @Prop({required: true, type:[String], default: []})
  images: string[];

  @Prop({required:true})
  slug: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({required: true})
  sellerUid: string;

  @Prop({required: true})
  isActive: boolean;

  @Prop({required: true})
  rating: number;

  @Prop({required: true})
  reviewCount: number;

}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Search index
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ sellerUid: 1 });