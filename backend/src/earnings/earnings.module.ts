import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EarningsController } from './earnings.controller';
import { EarningsService } from './earnings.service';
import { SellerEarning, SellerEarningSchema } from './schemas/seller-earning.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SellerGuard } from '../auth/guards/seller.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SellerEarning.name, schema: SellerEarningSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [EarningsController],
  providers: [EarningsService, SellerGuard],
  exports: [EarningsService],
})
export class EarningsModule {}
