import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/orders.schema';
import { Product, ProductSchema } from '../products/schemas/products.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { SellerGuard } from '../auth/guards/seller.guard';
import { BuyerGuard } from '../auth/guards/buyer.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, SellerGuard, BuyerGuard],
  exports: [OrdersService],
})
export class OrdersModule {}