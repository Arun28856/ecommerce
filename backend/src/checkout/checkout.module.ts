import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { Product, ProductSchema } from '../products/schemas/products.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { OrdersModule } from '../orders/orders.module';
import { PaymentsModule } from '../payments/payments.module';
import { AuthModule } from '../auth/auth.module';
import { BuyerGuard } from '../auth/guards/buyer.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService, BuyerGuard],
})
export class CheckoutModule {}