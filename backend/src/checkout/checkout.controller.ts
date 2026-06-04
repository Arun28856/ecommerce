import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dtos/checkout.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { BuyerGuard } from '../auth/guards/buyer.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('checkout')
@UseGuards(FirebaseAuthGuard, BuyerGuard) // buyers only
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  // Validate cart before showing summary
  @Post('validate')
  validateCart(
    @Body() body: { items: { productSlug: string; quantity: number }[] },
  ) {
    return this.checkoutService.validateCart(body.items);
  }

  // Get order summary with fees
  @Post('summary')
  getOrderSummary(
    @Body() body: { items: { productSlug: string; quantity: number }[] },
  ) {
    return this.checkoutService.getOrderSummary(body.items);
  }

  // Full checkout — create order + initiate payment
  @Post()
  checkout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: any,
  ) {
    return this.checkoutService.checkout(dto, user.uid);
  }
}