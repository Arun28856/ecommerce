import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, CategorySchema } from './schemas/categories.schema';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { SellerGuard } from '../auth/guards/seller.auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService, SellerGuard],
  exports: [CategoriesService],
})
export class CategoriesModule {}